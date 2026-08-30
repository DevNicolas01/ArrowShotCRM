import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const baseInput =
  'w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all duration-150 ease-in-out placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100'

const fixedHeightInput = `${baseInput} h-[38px]`

export function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </span>
      {children}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fixedHeightInput} ${props.className ?? ''}`} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${baseInput} resize-none py-2 ${props.className ?? ''}`} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fixedHeightInput} ${props.className ?? ''}`} />
}
