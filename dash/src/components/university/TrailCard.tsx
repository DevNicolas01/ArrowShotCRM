import { GraduationCap } from 'lucide-react'
import type { Trail } from '../../types'
import { ProgressBar } from './ProgressBar'

export function TrailCard({
  trail,
  totalModules,
  completedModules,
  onClick,
}: {
  trail: Trail
  totalModules: number
  completedModules: number
  onClick: () => void
}) {
  const percent = totalModules > 0 ? (completedModules / totalModules) * 100 : 0

  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
          <GraduationCap size={18} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-800">{trail.title}</p>
          <p className="text-xs text-slate-400">
            {completedModules}/{totalModules} módulos
          </p>
        </div>
      </div>
      <p className="line-clamp-2 text-xs text-slate-500">{trail.description}</p>
      <ProgressBar percent={percent} />
    </button>
  )
}
