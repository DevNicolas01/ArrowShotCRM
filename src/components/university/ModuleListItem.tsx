import { CheckCircle2, Lock, PlayCircle } from 'lucide-react'
import type { Module } from '../../types'

type ModuleState = 'completed' | 'unlocked' | 'locked'

export function ModuleListItem({
  module,
  state,
  onClick,
}: {
  module: Module
  state: ModuleState
  onClick: () => void
}) {
  const locked = state === 'locked'
  const completed = state === 'completed'

  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
        locked
          ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400'
          : 'border-slate-100 bg-white hover:border-brand-200 hover:bg-brand-50/40'
      }`}
    >
      {completed ? (
        <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
      ) : locked ? (
        <Lock size={18} className="shrink-0 text-slate-300" />
      ) : (
        <PlayCircle size={18} className="shrink-0 text-brand-500" />
      )}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${locked ? 'text-slate-400' : 'text-slate-800'}`}>
          {module.title}
        </p>
        <p className="truncate text-xs text-slate-400">{module.description}</p>
      </div>
    </button>
  )
}
