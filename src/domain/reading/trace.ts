export interface TracePoint {
  x: number
  y: number
}

/** Guías normalizadas (0–1). La comprobación admite el trazo irregular de un niño. */
export const LETTER_GUIDES: Record<string, TracePoint[]> = {
  A: [
    { x: 0.22, y: 0.84 },
    { x: 0.5, y: 0.16 },
    { x: 0.78, y: 0.84 },
  ],
  E: [
    { x: 0.3, y: 0.24 },
    { x: 0.72, y: 0.28 },
    { x: 0.32, y: 0.78 },
  ],
  I: [
    { x: 0.5, y: 0.18 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.82 },
  ],
  O: [
    { x: 0.5, y: 0.18 },
    { x: 0.8, y: 0.5 },
    { x: 0.5, y: 0.84 },
    { x: 0.22, y: 0.5 },
  ],
  U: [
    { x: 0.28, y: 0.2 },
    { x: 0.32, y: 0.75 },
    { x: 0.72, y: 0.22 },
  ],
  M: [
    { x: 0.16, y: 0.82 },
    { x: 0.18, y: 0.22 },
    { x: 0.5, y: 0.58 },
    { x: 0.82, y: 0.82 },
  ],
  P: [
    { x: 0.32, y: 0.84 },
    { x: 0.32, y: 0.2 },
    { x: 0.7, y: 0.36 },
  ],
  S: [
    { x: 0.7, y: 0.24 },
    { x: 0.32, y: 0.32 },
    { x: 0.68, y: 0.78 },
  ],
  L: [
    { x: 0.34, y: 0.16 },
    { x: 0.34, y: 0.8 },
    { x: 0.74, y: 0.8 },
  ],
  T: [
    { x: 0.24, y: 0.22 },
    { x: 0.76, y: 0.22 },
    { x: 0.5, y: 0.82 },
  ],
  N: [
    { x: 0.24, y: 0.82 },
    { x: 0.24, y: 0.2 },
    { x: 0.76, y: 0.82 },
  ],
}

/**
 * El trazo es válido si recorre los puntos de referencia en orden,
 * con un margen amplio para la edad.
 */
export function strokeCovers(points: TracePoint[], checkpoints: TracePoint[], tolerance = 0.34) {
  if (points.length < 4 || checkpoints.length === 0) return false
  let cursor = 0
  for (const checkpoint of checkpoints) {
    let found = -1
    for (let index = cursor; index < points.length; index += 1) {
      const point = points[index]!
      const distance = Math.hypot(point.x - checkpoint.x, point.y - checkpoint.y)
      if (distance <= tolerance) {
        found = index
        break
      }
    }
    if (found < 0) return false
    cursor = found + 1
  }
  return true
}
