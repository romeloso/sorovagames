import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function StatPill({
  icon,
  label,
  value,
  className,
}: {
  icon: ReactNode
  label: string
  value: string | number
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-w-[7.5rem] flex-col rounded-2xl bg-card/80 px-4 py-3 ring-1 ring-ink/10',
        className,
      )}
    >
      <span className="text-sm font-bold text-ink-soft">
        <span aria-hidden="true">{icon}</span> {label}
      </span>
      <span className="font-display text-2xl font-bold text-ink">{value}</span>
    </div>
  )
}
