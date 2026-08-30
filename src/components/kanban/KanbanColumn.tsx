import type { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'

export function KanbanColumn({
  id,
  label,
  count,
  accent = 'bg-slate-300',
  children,
}: {
  id: string
  label: string
  count: number
  accent?: string
  children: ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const textAccent = accent.replace('bg-', 'text-')

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 min-w-[280px] shrink-0 flex-col rounded-xl bg-slate-50 p-3 ${
        isOver ? 'ring-2 ring-brand-300' : ''
      }`}
    >
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        <p className={`text-[11px] font-bold uppercase tracking-wide ${textAccent}`}>{label}</p>
        <span className="ml-auto rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
          {count}
        </span>
      </div>
      <div className="min-h-[40px] flex-1 overflow-y-auto px-0.5">{children}</div>
    </div>
  )
}
