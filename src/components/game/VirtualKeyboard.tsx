import { cn } from '@/lib/cn'

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

export function VirtualKeyboard({
  highlightKey,
  onKey,
}: {
  highlightKey?: string
  onKey?: (key: string) => void
}) {
  const target = highlightKey?.toUpperCase()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2" aria-label="Teclado virtual">
      {ROWS.map((row) => (
        <div key={row.join('-')} className="flex justify-center gap-1.5 sm:gap-2">
          {row.map((key) => {
            const active = target === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onKey?.(key)}
                className={cn(
                  'grid h-11 w-9 place-items-center rounded-xl text-sm font-extrabold ring-1 transition sm:h-14 sm:w-12 sm:text-lg',
                  active
                    ? 'scale-110 bg-sun text-navy ring-2 ring-sun shadow-[0_0_0_4px_rgba(255,209,102,0.35)]'
                    : 'bg-card/90 text-ink ring-ink/10 hover:bg-sand',
                )}
                aria-current={active ? 'true' : undefined}
              >
                {key}
              </button>
            )
          })}
        </div>
      ))}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onKey?.(' ')}
          className={cn(
            'h-11 min-w-40 rounded-xl px-6 text-sm font-extrabold ring-1 transition sm:h-14',
            target === ' '
              ? 'scale-105 bg-sun text-navy ring-2 ring-sun'
              : 'bg-card/90 text-ink ring-ink/10 hover:bg-sand',
          )}
          aria-label="Espacio"
          aria-current={target === ' ' ? 'true' : undefined}
        >
          espacio
        </button>
      </div>
    </div>
  )
}
