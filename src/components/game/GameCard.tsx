import type { GameDefinition } from '@/types'
import { cn } from '@/lib/cn'

export function GameCard({
  game,
  progressRatio,
  onClick,
}: {
  game: GameDefinition
  progressRatio?: number
  onClick?: () => void
}) {
  const locked = game.status !== 'available'

  return (
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      className={cn(
        'relative flex min-h-44 w-full flex-col items-start justify-between rounded-[1.75rem] p-5 text-left transition',
        locked
          ? 'cursor-not-allowed bg-card/55 opacity-80'
          : 'bg-card/90 shadow-[0_12px_28px_rgba(31,42,55,0.1)] hover:-translate-y-1',
      )}
      style={{ boxShadow: locked ? undefined : `0 12px 28px ${game.accent}33` }}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <span className="text-5xl" aria-hidden="true">
          {game.icon}
        </span>
        {locked ? (
          <span className="rounded-xl bg-ink/10 px-3 py-1 text-sm font-bold">🔒 Pronto</span>
        ) : (
          <span
            className="rounded-xl px-3 py-1 text-sm font-bold text-white"
            style={{ backgroundColor: game.accent }}
          >
            Jugar
          </span>
        )}
      </div>
      <div>
        <h3 className="font-display text-2xl font-bold text-ink">{game.title}</h3>
        <p className="mt-1 text-sm font-semibold text-ink-soft">{game.description}</p>
        {!locked && typeof progressRatio === 'number' ? (
          <p className="mt-3 text-sm font-bold text-teal">
            Progreso: {Math.round(progressRatio * 100)}%
          </p>
        ) : null}
      </div>
    </button>
  )
}
