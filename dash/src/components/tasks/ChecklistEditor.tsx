import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { ChecklistItem } from '../../types/task'

export function ChecklistEditor({
  items,
  onChange,
}: {
  items: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
}) {
  const [text, setText] = useState('')
  const done = items.filter((i) => i.done).length

  const add = () => {
    if (!text.trim()) return
    onChange([...items, { id: crypto.randomUUID(), text: text.trim(), done: false }])
    setText('')
  }

  return (
    <div>
      {items.length > 0 && (
        <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${(done / items.length) * 100}%` }}
          />
        </div>
      )}
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id} className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={item.done}
              onChange={(e) =>
                onChange(items.map((i) => (i.id === item.id ? { ...i, done: e.target.checked } : i)))
              }
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
            />
            <span className={`flex-1 text-sm ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {item.text}
            </span>
            <button
              onClick={() => onChange(items.filter((i) => i.id !== item.id))}
              className="hidden text-slate-300 hover:text-red-500 group-hover:block"
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-1.5 flex items-center gap-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Adicionar item..."
          className="flex-1 rounded-md border border-transparent px-1.5 py-1 text-sm outline-none placeholder:text-slate-400 focus:border-slate-200"
        />
        <button onClick={add} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
