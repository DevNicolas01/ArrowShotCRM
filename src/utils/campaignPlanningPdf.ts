import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { UserOptions } from 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  META_FUNNEL_STAGE_LABEL,
  META_OBJECTIVE_LABEL,
  GOOGLE_ADS_NETWORK_LABEL,
  GOOGLE_BID_TYPE_LABEL,
  type Client,
  type CampaignPlanning,
  type PaidTrafficBriefing,
} from '../types'

/* Paleta — azul #2563EB como cor principal, textos #0F172A, fundo branco. */
const BLUE: [number, number, number] = [37, 99, 235]
const DARK: [number, number, number] = [15, 23, 42]
const MUTED: [number, number, number] = [100, 116, 139]
const ZEBRA: [number, number, number] = [241, 245, 249]
const LINE: [number, number, number] = [203, 213, 225]
const GREEN: [number, number, number] = [22, 163, 74]
const AMBER: [number, number, number] = [217, 119, 6]

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 18
const CONTENT_W = PAGE_W - MARGIN * 2
const BOTTOM_LIMIT = PAGE_H - 22

function brl(v?: number | null): string {
  if (v == null || Number.isNaN(v)) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Remove acentos e caracteres inválidos para nome de arquivo. */
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

/** Y onde a última tabela terminou (jspdf-autotable expõe em doc.lastAutoTable). */
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

function composeIcpB2C(b: PaidTrafficBriefing): string {
  return [
    b.b2cGenero && `Gênero: ${b.b2cGenero}`,
    b.b2cEstadoCivilFilhos && `Estado civil/filhos: ${b.b2cEstadoCivilFilhos}`,
    b.b2cFaixaEtaria && `Faixa etária: ${b.b2cFaixaEtaria}`,
    b.b2cEscolaridadeProfissao && `Escolaridade/profissão: ${b.b2cEscolaridadeProfissao}`,
    b.b2cRegiao && `Região: ${b.b2cRegiao}`,
  ]
    .filter(Boolean)
    .join(' · ')
}

function composeIcpB2B(b: PaidTrafficBriefing): string {
  return [
    b.b2bSetor && `Setor: ${b.b2bSetor}`,
    b.b2bFaturamentoMinimo != null && `Faturamento mínimo: ${brl(b.b2bFaturamentoMinimo)}`,
    b.b2bQuantidadeFuncionarios && `Nº de funcionários: ${b.b2bQuantidadeFuncionarios}`,
    b.b2bCargoDecisor && `Cargo do decisor: ${b.b2bCargoDecisor}`,
    b.b2bLocalizacao && `Localização: ${b.b2bLocalizacao}`,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** Uma palavra-chave por linha no formulário -> lista separada por vírgula. */
function keywordsToText(raw?: string): string {
  if (!raw) return ''
  return raw
    .split(/[\n,]+/)
    .map((k) => k.trim())
    .filter(Boolean)
    .join(', ')
}

function centerText(
  doc: jsPDF,
  text: string,
  y: number,
  size: number,
  style: 'normal' | 'bold',
  color: [number, number, number],
): void {
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

function paragraph(doc: jsPDF, text: string, y: number, color: [number, number, number]): number {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(color[0], color[1], color[2])
  const lines = doc.splitTextToSize(text, CONTENT_W) as string[]
  const startY = ensureSpace(doc, y, lines.length * 5 + 6)
  doc.text(lines, MARGIN, startY)
  return startY + lines.length * 5 + 4
}

function keywordBlock(doc: jsPDF, label: string, text: string, y: number): number {
  const startY = ensureSpace(doc, y, 22)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(DARK[0], DARK[1], DARK[2])
  doc.text(label, MARGIN, startY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
  const lines = doc.splitTextToSize(text, CONTENT_W) as string[]
  doc.text(lines, MARGIN, startY + 5)
  return startY + 5 + lines.length * 4.5 + 5
}

/** Círculo verde com "check" (configurado) ou âmbar com "relógio" (pendente). */
function drawStatusIcon(doc: jsPDF, x: number, y: number, ok: boolean): void {
  const r = 1.8
  const fill = ok ? GREEN : AMBER
  doc.setFillColor(fill[0], fill[1], fill[2])
  doc.circle(x, y, r, 'F')
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.45)
  if (ok) {
    doc.line(x - 0.85, y + 0.05, x - 0.2, y + 0.75)
    doc.line(x - 0.2, y + 0.75, x + 0.95, y - 0.75)
  } else {
    doc.line(x, y + 0.15, x, y - 0.95)
    doc.line(x, y + 0.15, x + 0.8, y + 0.45)
  }
}

function table(doc: jsPDF, opts: UserOptions): void {
  autoTable(doc, {
    theme: 'striped',
    styles: { font: 'helvetica', fontSize: 9, textColor: DARK, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fillColor: BLUE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: ZEBRA },
    margin: { left: MARGIN, right: MARGIN },
    ...opts,
  })
}

function addFooters(doc: jsPDF, clientName: string): void {
  const total = doc.getNumberOfPages()
  const centerName = truncate(clientName, 60)
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setDrawColor(LINE[0], LINE[1], LINE[2])
    doc.setLineWidth(0.3)
    doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
    doc.text('Arrow Shot — Marketing Digital', MARGIN, PAGE_H - 9)
    doc.text(centerName, PAGE_W / 2, PAGE_H - 9, { align: 'center' })
    doc.text(`${i}/${total}`, PAGE_W - MARGIN, PAGE_H - 9, { align: 'right' })
  }
}

/**
 * Gera e baixa um PDF de apresentação com o planejamento de campanha do
 * cliente. `planning` é o estado atual do formulário (pode conter edições
 * ainda não salvas); o briefing de público-alvo vem de `client`.
 */
export async function generateCampaignPlanningPdf(client: Client, planning: CampaignPlanning): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const now = new Date()
  const monthName = capitalize(format(now, 'MMMM', { locale: ptBR }))
  const year = format(now, 'yyyy')

  const acessos = planning.acessos ?? {}
  const meta = planning.metaAds
  const google = planning.googleAds
  const briefing = client.paidTrafficBriefing

  // ---------- CAPA ----------
  const baseUrl = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'
  const logo = await loadPngDataUrl(`${baseUrl}favicon.png`)
  if (logo) doc.addImage(logo, 'PNG', (PAGE_W - 24) / 2, 60, 24, 24)
  centerText(doc, 'ARROW SHOT', 100, 20, 'bold', BLUE)
  doc.setDrawColor(BLUE[0], BLUE[1], BLUE[2])
  doc.setLineWidth(0.6)
  doc.line(PAGE_W / 2 - 24, 106, PAGE_W / 2 + 24, 106)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(DARK[0], DARK[1], DARK[2])
  const nameLines = doc.splitTextToSize(client.companyName, CONTENT_W) as string[]
  let cy = 150
  for (const line of nameLines) {
    doc.text(line, PAGE_W / 2, cy, { align: 'center' })
    cy += 12
  }
  centerText(doc, 'Planejamento de Campanhas', cy + 4, 15, 'normal', BLUE)
  centerText(doc, `${monthName} de ${year}`, cy + 15, 11, 'normal', MUTED)

  // ---------- SEÇÃO 1 — ACESSOS CONFIGURADOS ----------
  doc.addPage()
  let y = sectionHeading(doc, '1. Acessos configurados', MARGIN)

  const gtmOk = !!(acessos.gtmContainerCriado && acessos.gtmInstaladoNoSite && acessos.gtmRastreamentoCompleto)
  const accessRows: { label: string; ok: boolean; sub?: boolean }[] = [
    { label: 'Site', ok: !!acessos.siteUrl },
    { label: 'Instagram', ok: !!acessos.instagramLink },
    { label: 'Google Ads', ok: !!(google?.verbaMensal || google?.campanhas?.length) },
    { label: 'Google Tag Manager (GTM)', ok: gtmOk },
    { label: 'Container GTM criado', ok: !!acessos.gtmContainerCriado, sub: true },
    { label: 'GTM instalado no site', ok: !!acessos.gtmInstaladoNoSite, sub: true },
    { label: 'Rastreamento completo configurado', ok: !!acessos.gtmRastreamentoCompleto, sub: true },
    { label: 'Google Meu Negócio', ok: !!acessos.gmbConfigurado },
    { label: 'WhatsApp para campanhas', ok: !!acessos.whatsappNumero },
  ]

  table(doc, {
    startY: y,
    head: [['Acesso', 'Status']],
    body: accessRows.map((r) => [r.label, r.ok ? 'Configurado' : 'Pendente']),
    columnStyles: {
      1: { cellWidth: 44, cellPadding: { top: 2, right: 2, bottom: 2, left: 8 } },
    },
    didParseCell: (data) => {
      if (data.section !== 'body') return
      const r = accessRows[data.row.index]
      if (!r) return
      if (data.column.index === 1) {
        data.cell.styles.textColor = r.ok ? GREEN : AMBER
        data.cell.styles.fontStyle = 'bold'
      } else if (r.sub) {
        data.cell.styles.textColor = MUTED
        data.cell.styles.cellPadding = { top: 2, right: 2, bottom: 2, left: 6 }
      }
    },
    didDrawCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 1) return
      const r = accessRows[data.row.index]
      if (!r) return
      drawStatusIcon(doc, data.cell.x + 4.5, data.cell.y + data.cell.height / 2, r.ok)
    },
  })
  y = lastTableY(doc) + 12

  // ---------- SEÇÃO 2 — PLANEJAMENTO META ADS ----------
  const metaFilled = !!(
    meta?.verbaMensal ||
    meta?.campanhas?.length ||
    meta?.distribuicaoTopoPercent != null ||
    meta?.distribuicaoMeioPercent != null ||
    meta?.distribuicaoFundoPercent != null
  )
  if (metaFilled) {
    y = sectionHeading(doc, '2. Planejamento Meta Ads', ensureSpace(doc, y, 44))
    const dias = meta.diasDoMes || 30
    const diaria = meta.verbaMensal ? meta.verbaMensal / dias : undefined
    autoTable(doc, {
      startY: y,
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 10, textColor: DARK, cellPadding: 1.5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 46 } },
      margin: { left: MARGIN, right: MARGIN },
      body: [
        ['Verba mensal', brl(meta.verbaMensal)],
        ['Verba diária', brl(diaria)],
        ['Dias considerados', String(dias)],
      ],
    })
    y = lastTableY(doc) + 6

    const funnel: [string, number | undefined][] = [
      [META_FUNNEL_STAGE_LABEL.topo, meta.distribuicaoTopoPercent],
      [META_FUNNEL_STAGE_LABEL.meio, meta.distribuicaoMeioPercent],
      [META_FUNNEL_STAGE_LABEL.fundo, meta.distribuicaoFundoPercent],
    ]
    if (funnel.some(([, p]) => p != null)) {
      table(doc, {
        startY: ensureSpace(doc, y, 30),
        head: [['Etapa do funil', '% do orçamento', 'Verba mensal (R$)']],
        body: funnel.map(([label, p]) => [
          label,
          p != null ? `${p}%` : '—',
          p != null && meta.verbaMensal != null ? brl((meta.verbaMensal * p) / 100) : '—',
        ]),
      })
      y = lastTableY(doc) + 6
    }

    if (meta.campanhas?.length) {
      table(doc, {
        startY: ensureSpace(doc, y, 24),
        head: [['Etapa', 'Descrição', 'Objetivo', 'Públicos', 'Verba diária']],
        body: meta.campanhas.map((c) => [
          c.etapaFunil ? META_FUNNEL_STAGE_LABEL[c.etapaFunil] : '—',
          c.descricao || '—',
          c.objetivo ? META_OBJECTIVE_LABEL[c.objetivo] : '—',
          c.publicos || '—',
          brl(c.verbaDiaria),
        ]),
        columnStyles: { 4: { cellWidth: 24, halign: 'right' } },
      })
      y = lastTableY(doc) + 12
    } else {
      y += 6
    }
  }

  // ---------- SEÇÃO 3 — PLANEJAMENTO GOOGLE ADS ----------
  const googleFilled = !!(
    google?.verbaMensal ||
    google?.campanhas?.length ||
    google?.palavrasChavePositivas ||
    google?.palavrasChaveNegativas
  )
  if (googleFilled) {
    y = sectionHeading(doc, '3. Planejamento Google Ads', ensureSpace(doc, y, 44))
    const dias = google.diasDoMes || 30
    const diaria = google.verbaMensal ? google.verbaMensal / dias : undefined
    autoTable(doc, {
      startY: y,
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 10, textColor: DARK, cellPadding: 1.5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 46 } },
      margin: { left: MARGIN, right: MARGIN },
      body: [
        ['Verba mensal', brl(google.verbaMensal)],
        ['Verba diária', brl(diaria)],
        ['Dias considerados', String(dias)],
      ],
    })
    y = lastTableY(doc) + 6

    if (google.campanhas?.length) {
      table(doc, {
        startY: ensureSpace(doc, y, 24),
        head: [['Rede', 'Nome', 'Grupos de anúncios', 'Lance', 'Verba diária']],
        body: google.campanhas.map((c) => [
          c.rede ? GOOGLE_ADS_NETWORK_LABEL[c.rede] : '—',
          c.nomeCampanha || '—',
          c.gruposAnuncios || '—',
          c.tipoLance ? GOOGLE_BID_TYPE_LABEL[c.tipoLance] : '—',
          brl(c.verbaDiaria),
        ]),
        columnStyles: { 4: { cellWidth: 24, halign: 'right' } },
      })
      y = lastTableY(doc) + 8
    } else {
      y += 4
    }

    const pos = keywordsToText(google.palavrasChavePositivas)
    const neg = keywordsToText(google.palavrasChaveNegativas)
    if (pos) y = keywordBlock(doc, 'Palavras-chave positivas', pos, y)
    if (neg) y = keywordBlock(doc, 'Palavras-chave negativas', neg, y)
    y += 4
  }

  // ---------- SEÇÃO 4 — PÚBLICO-ALVO ----------
  y = sectionHeading(doc, '4. Público-alvo', ensureSpace(doc, y, 44))
  if (!briefing?.filledAt) {
    y = paragraph(doc, 'Briefing de Tráfego Pago ainda não preenchido.', y, MUTED)
  } else {
    table(doc, {
      startY: y,
      head: [['Campo', 'Detalhe']],
      body: [
        ['Perfil do cliente ideal (B2C)', composeIcpB2C(briefing) || '—'],
        ['Perfil do cliente ideal (B2B)', composeIcpB2B(briefing) || '—'],
        ['Principal dor do cliente', briefing.b2cDorPrincipal || '—'],
        ['Objeção mais comum', briefing.objecaoComum || '—'],
      ],
      columnStyles: { 0: { cellWidth: 54, fontStyle: 'bold' } },
    })
    y = lastTableY(doc) + 12
  }

  // ---------- SEÇÃO 5 — OBSERVAÇÕES GERAIS ----------
  y = sectionHeading(doc, '5. Observações gerais', ensureSpace(doc, y, 30))
  const obs = planning.observacoesGerais?.trim()
  paragraph(doc, obs || 'Nenhuma observação registrada.', y, obs ? DARK : MUTED)

  // ---------- RODAPÉ EM TODAS AS PÁGINAS ----------
  addFooters(doc, client.companyName)

  doc.save(`Planejamento_${slug(client.companyName) || 'Cliente'}_${slug(monthName)}_${year}.pdf`)
}
