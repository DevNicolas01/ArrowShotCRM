import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Copy, FileDown } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { generateMonthlyReportPdf } from '../../utils/monthlyReportPdf'
import { REPORT_TYPE_LABEL, REPORT_PLATFORM_LABEL, type Report } from '../../types'

function fmtInt(v?: number): string {
  if (v == null) return '—'
  return Math.round(v).toLocaleString('pt-BR')
}

function fmtBRL(v?: number): string {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ReportViewModal({
  report,
  clientName,
  onClose,
}: {
  report: Report | null
  clientName: string
  onClose: () => void
}) {
  if (!report) return null

  const periodLabel = `${format(report.periodStart.toDate(), 'dd/MM/yyyy', { locale: ptBR })} até ${format(report.periodEnd.toDate(), 'dd/MM/yyyy', { locale: ptBR })}`

  const handleCopy = async () => {
    if (!report.weeklyText) return
    try {
      await navigator.clipboard.writeText(report.weeklyText)
      toast.success('Texto copiado')
    } catch {
      toast.error('Não foi possível copiar — copie manualmente')
    }
  }

  const handleDownloadPdf = async () => {
    try {
      await generateMonthlyReportPdf(clientName, report)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao gerar PDF')
    }
  }

  return (
    <Modal open={!!report} onClose={onClose} title={`Relatório ${REPORT_TYPE_LABEL[report.type]} — ${clientName}`} width="max-w-2xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-slate-100 text-slate-600">{periodLabel}</Badge>
          {report.platforms.map((p) => (
            <Badge key={p} className="bg-blue-50 text-blue-600">{REPORT_PLATFORM_LABEL[p]}</Badge>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            Gerado por {report.generatedByName} em {format(report.createdAt.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        </div>

        {report.type === 'weekly' ? (
          <>
            <textarea
              rows={14}
              readOnly
              value={report.weeklyText ?? ''}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[13px] leading-relaxed text-slate-700 outline-none"
            />
            <Button variant="secondary" icon={<Copy size={14} />} onClick={handleCopy} className="self-start">
              Copiar texto
            </Button>
          </>
        ) : (
          <>
            {report.meta && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-100 p-3">
                  <p className="text-xs text-slate-400">Investido</p>
                  <p className="text-lg font-bold text-slate-800">{fmtBRL(report.meta.metrics.current.spend)}</p>
                </div>
                <div className="rounded-lg border border-slate-100 p-3">
                  <p className="text-xs text-slate-400">Impressões</p>
                  <p className="text-lg font-bold text-slate-800">{fmtInt(report.meta.metrics.current.impressions)}</p>
                </div>
                <div className="rounded-lg border border-slate-100 p-3">
                  <p className="text-xs text-slate-400">Cliques</p>
                  <p className="text-lg font-bold text-slate-800">{fmtInt(report.meta.metrics.current.clicks)}</p>
                </div>
              </div>
            )}
            <Button icon={<FileDown size={14} />} onClick={handleDownloadPdf} className="self-start">
              Baixar PDF
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}
