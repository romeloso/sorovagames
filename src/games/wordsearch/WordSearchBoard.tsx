import { useMemo, useRef, useState, type PointerEvent } from 'react'
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
  const gridRef = useRef<HTMLDivElement>(null)
  const selectingRef = useRef(false)
  const anchorRef = useRef<{ row: number; col: number } | null>(null)
  const pathRef = useRef<Array<{ row: number; col: number }>>([])
  const [found, setFound] = useState<string[]>([])
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
    pathRef.current = []
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

  const rememberPath = (cells: Array<{ row: number; col: number }>) => {
    pathRef.current = cells
    setPath(cells)
  }

  const cellFromEvent = (event: { clientX: number; clientY: number; target: EventTarget | null }) => {
    const grid = gridRef.current
    if (!grid) return null
    const direct =
      event.target instanceof Element ? event.target.closest<HTMLElement>('[data-cell]') : null
    const hovered =
      direct && grid.contains(direct)
        ? direct
        : document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-cell]')
    if (!hovered || !grid.contains(hovered)) return null
    const row = Number(hovered.dataset.row)
    const col = Number(hovered.dataset.col)
    if (!Number.isInteger(row) || !Number.isInteger(col)) return null
    return { row, col }
  }

  const extendSelection = (row: number, col: number) => {
    const anchor = anchorRef.current
    if (!selectingRef.current || !anchor) return
    rememberPath(lineBetween(anchor, { row, col }))
  }

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>, row: number, col: number) => {
    event.preventDefault()
    selectingRef.current = true
    anchorRef.current = { row, col }
    rememberPath([{ row, col }])
    const grid = gridRef.current
    if (grid && typeof grid.setPointerCapture === 'function') {
      try {
        grid.setPointerCapture(event.pointerId)
      } catch {
        // El entorno de pruebas no siempre activa el puntero.
      }
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const cell = cellFromEvent(event)
    if (!cell) return
    extendSelection(cell.row, cell.col)
  }

  const onPointerUp = () => {
    if (!selectingRef.current) return
    selectingRef.current = false
    anchorRef.current = null
    finishSelection(pathRef.current)
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
          ref={gridRef}
          data-testid="wordsearch-grid"
          className="mx-auto grid max-w-md gap-1 select-none touch-none"
          style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
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
                  data-cell
                  data-row={rowIndex}
                  data-col={colIndex}
                  className={cn(
                    'aspect-square rounded-lg text-sm font-black transition sm:rounded-xl sm:text-base',
                    foundColor
                      ? 'text-white'
                      : active
                        ? 'bg-sun text-navy'
                        : 'bg-white/10 text-white hover:bg-white/20',
                  )}
                  style={foundColor ? { backgroundColor: foundColor } : undefined}
                  onPointerDown={(event) => onPointerDown(event, rowIndex, colIndex)}
                >
                  {letter}
                </button>
              )
            }),
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-white/90 p-4 ring-1 ring-ink/5 sm:p-5">
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
