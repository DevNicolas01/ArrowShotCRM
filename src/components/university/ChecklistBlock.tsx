import type { ChecklistItem } from '../../types'
import { ProgressBar } from './ProgressBar'

/** Learner-facing checklist viewer — checks items on/off, doesn't add/remove
 *  them (that's authored once by an admin in ModuleFormModal). */
export function ChecklistBlock({
  items,
  onChange,
  disabled,
}: {
  items: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
  disabled?: boolean
}) {
  if (items.length === 0) return null
  const done = items.filter((i) => i.done).length

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Checklist de aprendizado</p>
        <span className="text-xs text-slate-400">
          {done}/{items.length}
        </span>
      </div>
      <ProgressBar percent={(done / items.length) * 100} />
      <ul className="mt-3 flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 rounded-md px-1 py-1">
            <input
              type="checkbox"
              checked={item.done}
              disabled={disabled}
              onChange={(e) =>
                onChange(items.map((i) => (i.id === item.id ? { ...i, done: e.target.checked } : i)))
              }
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
            />
            <span className={`flex-1 text-sm ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
