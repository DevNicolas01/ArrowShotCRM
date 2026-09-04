import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { UserOptions } from 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { percentChange, previousPeriod } from './metaReportData'
import type { Report, ReportEntitySummary } from '../types'

/* Mesma paleta do restante da plataforma — azul #2563EB, texto #0F172A. */
const BLUE: [number, number, number] = [37, 99, 235]
const DARK: [number, number, number] = [15, 23, 42]
const MUTED: [number, number, number] = [100, 116, 139]
const ZEBRA: [number, number, number] = [241, 245, 249]
const LINE: [number, number, number] = [203, 213, 225]
const GREEN: [number, number, number] = [22, 163, 74]
const RED: [number, number, number] = [220, 38, 38]

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 18
const CONTENT_W = PAGE_W - MARGIN * 2
const BOTTOM_LIMIT = PAGE_H - 22

const PLATFORM_LABEL: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  audience_network: 'Audience Network',
  messenger: 'Messenger',
}

function brl(v?: number | null): string {
  if (v == null || Number.isNaN(v)) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function int(v?: number | null): string {
  if (v == null || Number.isNaN(v)) return '—'
  return Math.round(v).toLocaleString('pt-BR')
}

function pct(v?: number | null): string {
  if (v == null || Number.isNaN(v)) return '—'
  return `${v.toFixed(2).replace('.', ',')}%`
}

function changeLabel(v?: number): string {
  if (v == null || Number.isNaN(v)) return '—'
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toFixed(1).replace('.', ',')}%`
}

function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

function lastTableY(doc: jsPDF): number {
  const t = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
  return t?.finalY ?? MARGIN
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > BOTTOM_LIMIT) {
    doc.addPage()
    return MARGIN
  }
  return y
}

async function loadPngDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function centerText(doc: jsPDF, text: string, y: number, size: number, style: 'normal' | 'bold', color: [number, number, number]): void {
  doc.setFont('helvetica', style)
  doc.setFontSize(size)
  doc.setTextColor(color[0], color[1], color[2])
  doc.text(text, PAGE_W / 2, y, { align: 'center' })
}

function sectionHeading(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(BLUE[0], BLUE[1], BLUE[2])
  doc.rect(MARGIN, y - 4, 3, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(DARK[0], DARK[1], DARK[2])
  doc.text(title, MARGIN + 6, y + 1)
  return y + 10
}

function subHeading(doc: jsPDF, title: string, y: number): number {
  const startY = ensureSpace(doc, y, 12)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(DARK[0], DARK[1], DARK[2])
  doc.text(title, MARGIN, startY)
  return startY + 6
}

function table(doc: jsPDF, opts: UserOptions): void {
  autoTable(doc, {
    theme: 'striped',
    styles: { font: 'helvetica', fontSize: 8.5, textColor: DARK, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fillColor: BLUE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: ZEBRA },
    margin: { left: MARGIN, right: MARGIN },
    ...opts,
  })
}

/** Tabela "Métrica | Atual | Anterior | Variação" — variação em verde/vermelho
 *  conforme o sinal. */
function metricsTable(doc: jsPDF, y: number, rows: { label: string; current: string; previous?: string; change?: number }[]): number {
  const hasComparison = rows.some((r) => r.previous != null)
  table(doc, {
    startY: ensureSpace(doc, y, 30),
    head: hasComparison ? [['Métrica', 'Período atual', 'Período anterior', 'Variação']] : [['Métrica', 'Valor']],
    body: rows.map((r) => (hasComparison ? [r.label, r.current, r.previous ?? '—', changeLabel(r.change)] : [r.label, r.current])),
    columnStyles: hasComparison ? { 3: { halign: 'right', fontStyle: 'bold' } } : { 1: { halign: 'right', fontStyle: 'bold' } },
    didParseCell: (data) => {
      if (data.section !== 'body') return
      const lastCol = hasComparison ? 3 : 1
      if (data.column.index !== lastCol) return
      const change = rows[data.row.index]?.change
      if (change == null) return
      data.cell.styles.textColor = change > 0 ? GREEN : change < 0 ? RED : MUTED
    },
  })
  return lastTableY(doc) + 10
}

function entityTable(doc: jsPDF, y: number, title: string, rows: ReportEntitySummary[]): number {
  y = subHeading(doc, title, y)
  if (rows.length === 0) {
    table(doc, { startY: y, head: [['—']], body: [['Nenhum dado disponível no período.']] })
    return lastTableY(doc) + 10
  }
  const hasStatus = rows.some((r) => r.status || r.objective)
  table(doc, {
    startY: y,
    head: hasStatus
      ? [['Nome', 'Status', 'Investimento', 'Impressões', 'Cliques', 'CTR']]
      : [['Nome', 'Investimento', 'Impressões', 'Cliques', 'CTR']],
    body: rows.map((r) =>
      hasStatus
        ? [truncate(r.name, 40), r.status ?? r.objective ?? '—', brl(r.spend), int(r.impressions), int(r.clicks), pct(r.ctr)]
        : [truncate(r.name, 40), brl(r.spend), int(r.impressions), int(r.clicks), pct(r.ctr)]
    ),
  })
  return lastTableY(doc) + 10
}

function addPageHeader(doc: jsPDF, logo: string | null): void {
  if (logo) doc.addImage(logo, 'PNG', MARGIN, 8, 8, 8)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(BLUE[0], BLUE[1], BLUE[2])
  doc.text('ARROW SHOT', logo ? MARGIN + 11 : MARGIN, 13)
  doc.setDrawColor(LINE[0], LINE[1], LINE[2])
  doc.setLineWidth(0.3)
  doc.line(MARGIN, 18, PAGE_W - MARGIN, 18)
}

function addFooters(doc: jsPDF, clientName: string, periodLabel: string, logo: string | null): void {
  const total = doc.getNumberOfPages()
  const centerLabel = truncate(`${clientName} — ${periodLabel}`, 70)
  for (let i = 2; i <= total; i++) {
    doc.setPage(i)
    addPageHeader(doc, logo)
    doc.setDrawColor(LINE[0], LINE[1], LINE[2])
    doc.setLineWidth(0.3)
    doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
    doc.text('Arrow Shot — Marketing Digital', MARGIN, PAGE_H - 9)
    doc.text(centerLabel, PAGE_W / 2, PAGE_H - 9, { align: 'center' })
    doc.text(`${i - 1}/${total - 1}`, PAGE_W - MARGIN, PAGE_H - 9, { align: 'right' })
  }
}

/** Gera e baixa o PDF do relatório mensal — usa o snapshot já salvo no
 *  Firestore (`report.meta`), nunca busca dados novos na API do Meta. */
export async function generateMonthlyReportPdf(clientName: string, report: Report): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const periodStart = report.periodStart.toDate()
  const periodEnd = report.periodEnd.toDate()
  const periodLabel = `${format(periodStart, 'dd/MM/yyyy', { locale: ptBR })} a ${format(periodEnd, 'dd/MM/yyyy', { locale: ptBR })}`
  const prev = previousPeriod(periodStart, periodEnd)
  const prevLabel = `${format(prev.start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(prev.end, 'dd/MM/yyyy', { locale: ptBR })}`

  const baseUrl = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'
  const logo = await loadPngDataUrl(`${baseUrl}favicon.png`)

  // ---------- CAPA ----------
  if (logo) doc.addImage(logo, 'PNG', (PAGE_W - 24) / 2, 60, 24, 24)
  centerText(doc, 'ARROW SHOT', 100, 20, 'bold', BLUE)
  doc.setDrawColor(BLUE[0], BLUE[1], BLUE[2])
  doc.setLineWidth(0.6)
  doc.line(PAGE_W / 2 - 24, 106, PAGE_W / 2 + 24, 106)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(DARK[0], DARK[1], DARK[2])
  const nameLines = doc.splitTextToSize(`Relatório de ${clientName}`, CONTENT_W) as string[]
  let cy = 150
  for (const line of nameLines) {
    doc.text(line, PAGE_W / 2, cy, { align: 'center' })
    cy += 11
  }
  centerText(doc, 'Análise de desempenho', cy + 4, 14, 'normal', BLUE)
  centerText(doc, `Período: ${periodLabel}`, cy + 15, 11, 'normal', MUTED)
  centerText(doc, `Comparado a: ${prevLabel}`, cy + 22, 10, 'normal', MUTED)

  // ---------- SEÇÃO META ADS ----------
  if (report.platforms.includes('meta')) {
    doc.addPage()
    addPageHeader(doc, logo)
    let y = sectionHeading(doc, 'Meta Ads', MARGIN + 14)

    const meta = report.meta
    if (!meta) {
      y = subHeading(doc, 'Dados do Meta Ads não disponíveis para este relatório.', y)
    } else {
      const c = meta.metrics.current
      const p = meta.metrics.previous

      y = subHeading(doc, 'Métricas principais', y)
      y = metricsTable(doc, y, [
        { label: 'Valor investido', current: brl(c.spend), previous: p && brl(p.spend), change: percentChange(c.spend, p?.spend) },
        { label: 'CTR', current: pct(c.ctr), previous: p && pct(p.ctr), change: percentChange(c.ctr, p?.ctr) },
        { label: 'CPC médio', current: brl(c.cpc), previous: p && brl(p.cpc), change: percentChange(c.cpc, p?.cpc) },
        { label: 'CPM médio', current: brl(c.cpm), previous: p && brl(p.cpm), change: percentChange(c.cpm, p?.cpm) },
        { label: 'Impressões totais', current: int(c.impressions), previous: p && int(p.impressions), change: percentChange(c.impressions, p?.impressions) },
        { label: 'Alcance total', current: int(c.reach), previous: p && int(p.reach), change: percentChange(c.reach, p?.reach) },
        { label: 'Total de cliques', current: int(c.clicks), previous: p && int(p.clicks), change: percentChange(c.clicks, p?.clicks) },
        { label: 'Conversas iniciadas', current: int(c.conversations), previous: p && int(p.conversations), change: percentChange(c.conversations, p?.conversations) },
        { label: 'Saldo atual', current: brl(meta.balance) },
      ])

      y = subHeading(doc, 'Funil', ensureSpace(doc, y, 20))
      table(doc, {
        startY: y,
        head: [['Etapa', 'Valor']],
        body: [
          ['Valor investido', brl(c.spend)],
          ['Impressões', int(c.impressions)],
          ['Alcance', int(c.reach)],
          ['Cliques', int(c.clicks)],
          ['Cliques no link', int(c.linkClicks)],
          ['Conversas iniciadas', int(c.conversations)],
        ],
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      })
      y = lastTableY(doc) + 10

      y = subHeading(doc, 'Conversões e ações por tipo', ensureSpace(doc, y, 20))
      if (meta.actionsSummary.length === 0) {
        table(doc, { startY: y, head: [['—']], body: [['Nenhuma ação registrada no período.']] })
      } else {
        table(doc, {
          startY: y,
          head: [['Ação', 'Total']],
          body: meta.actionsSummary.map((a) => [a.label, int(a.value)]),
          columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
        })
      }
      y = lastTableY(doc) + 10

      y = entityTable(doc, ensureSpace(doc, y, 20), 'Campanhas em destaque', meta.topCampaigns)
      y = entityTable(doc, ensureSpace(doc, y, 20), 'Conjuntos de anúncios em destaque', meta.topAdSets)
      y = entityTable(doc, ensureSpace(doc, y, 20), 'Anúncios em destaque', meta.topAds)

      y = subHeading(doc, 'Breakdown por plataforma', ensureSpace(doc, y, 20))
      if (meta.platformBreakdown.length === 0) {
        table(doc, { startY: y, head: [['—']], body: [['Sem dados de breakdown por plataforma.']] })
      } else {
        table(doc, {
          startY: y,
          head: [['Plataforma', 'Alcance', 'Impressões', 'Cliques', 'Valor investido']],
          body: meta.platformBreakdown.map((row) => [
            PLATFORM_LABEL[row.platform] ?? row.platform,
            int(row.reach),
            int(row.impressions),
            int(row.clicks),
            brl(row.spend),
          ]),
        })
      }
    }
  }

  // ---------- SEÇÃO GOOGLE ADS ----------
  if (report.platforms.includes('google')) {
    doc.addPage()
    addPageHeader(doc, logo)
    let y = sectionHeading(doc, 'Google Ads', MARGIN + 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
    const msg = doc.splitTextToSize(
      'A integração com a API do Google Ads ainda não está disponível nesta plataforma — esta seção será preenchida automaticamente assim que a integração for concluída.',
      CONTENT_W
    ) as string[]
    doc.text(msg, MARGIN, y)
    y += msg.length * 5
  }

  addFooters(doc, clientName, periodLabel, logo)
  doc.save(`Relatorio_${slug(clientName) || 'Cliente'}_${slug(periodLabel)}.pdf`)
}
