import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { WordSearchPuzzle } from '@/lib/wordsearch'
import { WordSearchBoard } from './WordSearchBoard'

const puzzle: WordSearchPuzzle = {
  id: 'test',
  title: 'Prueba',
  size: 3,
  words: ['SOL'],
  grid: [
    ['S', 'O', 'L'],
    ['A', 'B', 'C'],
    ['D', 'E', 'F'],
  ],
  placements: [
    {
      word: 'SOL',
      row: 0,
      col: 0,
      direction: 'horizontal',
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ],
    },
  ],
}

function cell(row: number, col: number) {
  const grid = screen.getByTestId('wordsearch-grid')
  const button = grid.querySelector<HTMLButtonElement>(`[data-row="${row}"][data-col="${col}"]`)
  if (!button) throw new Error(`Celda ${row},${col} no encontrada`)
  return button
}

describe('WordSearchBoard', () => {
  it('marca la línea mientras se arrastra y reconoce la palabra', () => {
    const onComplete = vi.fn()
    render(<WordSearchBoard puzzle={puzzle} onComplete={onComplete} />)

    const end = cell(0, 2)
    document.elementFromPoint = () => end

    fireEvent.pointerDown(cell(0, 0), { pointerId: 1, clientX: 8, clientY: 8, button: 0 })
    fireEvent.pointerMove(screen.getByTestId('wordsearch-grid'), {
      pointerId: 1,
      clientX: 40,
      clientY: 8,
    })

    expect(cell(0, 0).className).toContain('bg-sun')
    expect(cell(0, 1).className).toContain('bg-sun')
    expect(cell(0, 2).className).toContain('bg-sun')

    fireEvent.pointerUp(screen.getByTestId('wordsearch-grid'), { pointerId: 1 })
    Reflect.deleteProperty(document, 'elementFromPoint')

    expect(screen.getByText('SOL').className).toContain('line-through')
  })
})
