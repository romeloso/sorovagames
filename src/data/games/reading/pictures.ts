/** Ilustraciones estables. El mismo emoji representa siempre la misma palabra. */
export const WORD_PICTURES: Record<string, { emoji: string; alt: string }> = {
  SOL: { emoji: '☀️', alt: 'Un sol' },
  LUNA: { emoji: '🌙', alt: 'Una luna' },
  OSO: { emoji: '🐻', alt: 'Un oso' },
  PAN: { emoji: '🍞', alt: 'Un pan' },
  MAMA: { emoji: '👩', alt: 'Mamá' },
  MAMÁ: { emoji: '👩', alt: 'Mamá' },
  PAPA: { emoji: '👨', alt: 'Papá' },
  PAPÁ: { emoji: '👨', alt: 'Papá' },
  GATO: { emoji: '🐱', alt: 'Un gato' },
  CASA: { emoji: '🏠', alt: 'Una casa' },
  MESA: { emoji: '🪑', alt: 'Una mesa' },
  SOPA: { emoji: '🍲', alt: 'Un plato de sopa' },
  LECHE: { emoji: '🥛', alt: 'Un vaso de leche' },
  UVA: { emoji: '🍇', alt: 'Uvas' },
  ELEFANTE: { emoji: '🐘', alt: 'Un elefante' },
  ISLA: { emoji: '🏝️', alt: 'Una isla' },
  PELOTA: { emoji: '⚽', alt: 'Una pelota' },
  PALOMA: { emoji: '🕊️', alt: 'Una paloma' },
  MALETA: { emoji: '🧳', alt: 'Una maleta' },
  CAMISA: { emoji: '👕', alt: 'Una camisa' },
  AGUA: { emoji: '💧', alt: 'Agua' },
  MAR: { emoji: '🌊', alt: 'El mar' },
  PEZ: { emoji: '🐟', alt: 'Un pez' },
  SAPO: { emoji: '🐸', alt: 'Un sapo' },
  PALA: { emoji: '🥄', alt: 'Una pala' },
  NIDO: { emoji: '🪺', alt: 'Un nido' },
  MANO: { emoji: '✋', alt: 'Una mano' },
  ARBOL: { emoji: '🌳', alt: 'Un árbol' },
  ÁRBOL: { emoji: '🌳', alt: 'Un árbol' },
  MIEL: { emoji: '🍯', alt: 'Miel' },
}

export function pictureFor(word: string) {
  return WORD_PICTURES[word.normalize('NFC').toLocaleUpperCase('es')]
}
