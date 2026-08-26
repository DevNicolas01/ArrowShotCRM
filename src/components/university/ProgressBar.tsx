export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full bg-brand-500 transition-all" style={{ width: `${clamped}%` }} />
    </div>
  )
}
