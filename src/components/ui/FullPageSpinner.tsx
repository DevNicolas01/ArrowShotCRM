export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  )
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <div className={`animate-spin rounded-full border-2 border-slate-200 border-t-brand-600 ${className}`} />
}
