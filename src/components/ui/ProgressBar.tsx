import { cn } from '@/lib/cn'

interface ProgressBarProps {
  value: number
  label?: string
  colorClassName?: string
  className?: string
}

export function ProgressBar({
  value,
  label,
  colorClassName = 'bg-teal',
  className,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)))

  return (
    <div className={cn('w-full', className)}>
      {label ? (
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-ink-soft">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      ) : null}
      <div
        className="h-4 overflow-hidden rounded-full bg-card/80 ring-1 ring-ink/10"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
