import { useState, type ReactNode } from 'react'

export function Tabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-100 px-5">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={`border-b-2 px-2 py-2.5 text-sm font-medium transition-colors ${
              active === i
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="px-5 py-4">{tabs[active].content}</div>
    </div>
  )
}
