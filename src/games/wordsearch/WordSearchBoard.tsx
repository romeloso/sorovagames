import { useMemo, useRef, useState } from 'react'
import { BRAND_COLORS } from '@/config/app'
import { SmilingStar } from '@/components/brand/SmilingStar'
import { Button } from '@/components/ui/Button'
import { cellsMatchPath, lineBetween, type WordSearchPuzzle } from '@/lib/wordsearch'
import { cn } from '@/lib/cn'

const FOUND_COLORS = [
  BRAND_COLORS.pink,
  BRAND_COLORS.emerald,
  BRAND_COLORS.sky,
  BRAND_COLORS.violet,
  BRAND_COLORS.amber,
  BRAND_COLORS.indigo,
]

function cellKey(row: number, col: number) {
  return `${row}:${col}`
}

export function WordSearchBoard({
  puzzle,
  onComplete,
  onPlaySound,
}: {
  puzzle: WordSearchPuzzle
  onComplete: (foundCount: number, total: number, durationMs: number) => void
  onPlaySound?: (name: 'correct' | 'wrong' | 'reward') => void
}) {
  const startedAt = useRef(Date.now())
  const [found, setFound] = useState<string[]>([])
  const [selecting, setSelecting] = useState(false)
  const [anchor, setAnchor] = useState<{ row: number; col: number } | null>(null)
  const [path, setPath] = useState<Array<{ row: number; col: number }>>([])
  const [message, setMessage] = useState<string | null>(null)

  const foundCells = useMemo(() => {
    const map = new Map<string, string>()
    found.forEach((word, index) => {
      const placement = puzzle.placements.find((item) => item.word === word)
      const color = FOUND_COLORS[index % FOUND_COLORS.length]!
      placement?.cells.forEach((cell) => map.set(cellKey(cell.row, cell.col), color))
    })
    return map
  }, [found, puzzle.placements])

  const selectingKeys = useMemo(() => new Set(path.map((cell) => cellKey(cell.row, cell.col))), [path])

  const finishSelection = (cells: Array<{ row: number; col: number }>) => {
    setSelecting(false)
    setAnchor(null)
    setPath([])
    if (cells.length < 2) return

    const match = puzzle.placements.find(
      (placement) => !found.includes(placement.word) && cellsMatchPath(cells, placement.cells),
    )

    if (!match) {
      onPlaySound?.('wrong')
      setMessage('Sigue buscando…')
      window.setTimeout(() => setMessage(null), 900)
      return
    }

    const nextFound = [...found, match.word]
    setFound(nextFound)
    onPlaySound?.('correct')
    setMessage(`¡${match.word}!`)

    if (nextFound.length >= puzzle.words.length) {
      onPlaySound?.('reward')
      window.setTimeout(() => {
        onComplete(nextFound.length, puzzle.words.length, Date.now() - startedAt.current)
      }, 650)
    } else {
      window.setTimeout(() => setMessage(null), 900)
    }
  }

  const onPointerDown = (row: number, col: number) => {
    setSelecting(true)
    setAnchor({ row, col })
    setPath([{ row, col }])
  }

  const onPointerEnter = (row: number, col: number) => {
    if (!selecting || !anchor) return
    setPath(lineBetween(anchor, { row, col }))
  }

  const onPointerUp = () => {
    if (!selecting) return
    finishSelection(path)
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-navy p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.35)] sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">{puzzle.title}</h2>
            <p className="text-sm font-semibold text-white/70">
              Encontradas {found.length}/{puzzle.words.length}
            </p>
          </div>
          <SmilingStar size={48} className={found.length > 0 ? 'animate-pulse-soft' : ''} />
        </div>

        <div
          className="mx-auto grid max-w-md gap-1 select-none touch-none"
          style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {puzzle.grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => {
              const key = cellKey(rowIndex, colIndex)
              const foundColor = foundCells.get(key)
              const active = selectingKeys.has(key)
              return (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    'aspect-square rounded-lg text-sm font-black transition sm:rounded-xl sm:text-base',
                    foundColor
                      ? 'text-white'
                      : active
                        ? 'bg-sun text-navy'
                        : 'bg-white/10 text-white hover:bg-white/20',
                  )}
                  style={foundColor ? { backgroundColor: foundColor } : undefined}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId)
                    onPointerDown(rowIndex, colIndex)
                  }}
                  onPointerEnter={() => onPointerEnter(rowIndex, colIndex)}
                >
                  {letter}
                </button>
              )
            }),
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-card/90 p-4 ring-1 ring-ink/5 sm:p-5">
        <h3 className="font-display text-xl font-bold">Palabras</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {puzzle.words.map((word, index) => {
            const isFound = found.includes(word)
            return (
              <li
                key={word}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-sm font-bold',
                  isFound ? 'text-white line-through decoration-2' : 'bg-sand text-ink',
                )}
                style={isFound ? { backgroundColor: FOUND_COLORS[index % FOUND_COLORS.length] } : undefined}
              >
                {word}
              </li>
            )
          })}
        </ul>
        {message ? (
          <p className="mt-3 font-display text-lg font-bold text-pink">{message}</p>
        ) : (
          <p className="mt-3 text-sm font-semibold text-ink-soft">
            Arrastra en línea recta para marcar cada palabra.
          </p>
        )}
        {found.length > 0 && found.length < puzzle.words.length ? (
          <Button
            className="mt-4"
            variant="secondary"
            size="md"
            onClick={() => setMessage('¡Tú puedes! Busca otra palabra.')}
          >
            Pista: mira en diagonal también
          </Button>
        ) : null}
      </section>
    </div>
  )
}
