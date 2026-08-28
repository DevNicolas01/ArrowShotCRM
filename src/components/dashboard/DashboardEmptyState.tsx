import { CheckCircle2 } from 'lucide-react'

const BADGES: { key: keyof DashboardEmptyStateProps['counts']; label: string; dot: string }[] = [
  { key: 'today', label: 'tarefas de hoje', dot: 'bg-blue-500' },
  { key: 'overdue', label: 'atrasadas', dot: 'bg-red-500' },
  { key: 'upcoming', label: 'próximas (7 dias)', dot: 'bg-emerald-500' },
  { key: 'inProduction', label: 'em produção', dot: 'bg-brand-500' },
  { key: 'waitingApproval', label: 'aguardando aprovação', dot: 'bg-amber-500' },
  { key: 'approved', label: 'aprovados', dot: 'bg-teal-500' },
]

interface DashboardEmptyStateProps {
  counts: {
    today: number
    overdue: number
    upcoming: number
    inProduction: number
    waitingApproval: number
    approved: number
  }
  onExpand: () => void
}

export function DashboardEmptyState({ counts, onExpand }: DashboardEmptyStateProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500">
          <CheckCircle2 size={14} className="text-white" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Tudo em dia por aqui</p>
        <button
          onClick={onExpand}
          className="ml-auto text-xs font-medium text-brand-500 hover:text-brand-600"
        >
          Ver detalhes
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {BADGES.map(({ key, label, dot }) => (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-white px-2.5 py-1 text-xs text-slate-500"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {counts[key]} {label}
          </span>
        ))}
      </div>
    </div>
  )
}
