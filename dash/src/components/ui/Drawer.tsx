import type { ReactNode } from 'react'
import { X } from 'lucide-react'

/** Right-hand slide-over used for task/content/client details.
 *  Chosen over full-page routes so opening an item never loses the board's scroll/filter state. */
export function Drawer({
  open,
  onClose,
  title,
  children,
  width = 'w-full max-w-xl',
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  width?: string
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className={`relative z-50 flex ${width} flex-col bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="min-w-0 text-base font-semibold text-slate-800">{title}</div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
