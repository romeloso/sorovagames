import { describe, expect, it } from 'vitest'
import { strokeCovers } from './trace'

describe('trazo de letras', () => {
  it('acepta un trazo que sigue la dirección con holgura', () => {
    const guide = [
      { x: 0.2, y: 0.8 },
      { x: 0.5, y: 0.2 },
      { x: 0.8, y: 0.8 },
    ]
    const drawn = [
      { x: 0.18, y: 0.82 },
      { x: 0.3, y: 0.6 },
      { x: 0.48, y: 0.24 },
      { x: 0.66, y: 0.55 },
      { x: 0.82, y: 0.78 },
    ]
    expect(strokeCovers(drawn, guide)).toBe(true)
  })

  it('no acepta un trazo en el orden contrario', () => {
    const guide = [
      { x: 0.2, y: 0.8 },
      { x: 0.5, y: 0.2 },
      { x: 0.8, y: 0.8 },
    ]
    const drawn = [
      { x: 0.8, y: 0.8 },
      { x: 0.5, y: 0.2 },
      { x: 0.2, y: 0.8 },
      { x: 0.1, y: 0.7 },
    ]
    expect(strokeCovers(drawn, guide)).toBe(false)
  })
})
