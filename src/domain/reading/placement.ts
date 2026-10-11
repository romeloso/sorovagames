export const READING_WORLD_ORDER = [
  'reading-sonidos',
  'reading-letras',
  'reading-silabas',
  'reading-palabras',
  'reading-historias',
  'reading-escritura',
] as const

export interface DiagnosticScores {
  sounds: number
  letters: number
  syllables: number
  words: number
  sentences: number
}

/** Elige el mundo de partida según lo que el niño ya muestra, no según la edad. */
export function recommendWorldFromScores(scores: DiagnosticScores) {
  if (scores.sounds < 0.5) return 'reading-sonidos'
  if (scores.letters < 0.5) return 'reading-letras'
  if (scores.syllables < 0.5) return 'reading-silabas'
  if (scores.words < 0.5) return 'reading-palabras'
  if (scores.sentences < 0.5) return 'reading-historias'
  return 'reading-escritura'
}

export function placementSummary(worldId: string) {
  const messages: Record<string, string> = {
    'reading-sonidos':
      'Conviene empezar por los sonidos: escuchar, rimar y notar cómo empiezan las palabras.',
    'reading-letras':
      'Ya distingue sonidos. El siguiente paso es unir cada letra con su sonido, empezando por las vocales.',
    'reading-silabas':
      'Reconoce letras. Ahora puede unir consonantes y vocales para formar sílabas.',
    'reading-palabras':
      'Ya junta sílabas. Toca leer palabras nuevas, no solo memorizar las que ya vio.',
    'reading-historias':
      'Lee palabras. El siguiente paso son oraciones cortas y cuentos con preguntas sencillas.',
    'reading-escritura':
      'Comprende oraciones. Puede practicar el trazo, el dictado y sus primeras frases.',
  }
  return messages[worldId] ?? messages['reading-sonidos']!
}
