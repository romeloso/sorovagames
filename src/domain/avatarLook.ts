export const SKIN_TONES = [
  { id: 'porcelain', label: 'Muy clara', color: '#F8D7C4' },
  { id: 'light', label: 'Clara', color: '#F3C2A0' },
  { id: 'peach', label: 'Durazno', color: '#E8B48A' },
  { id: 'tan', label: 'Canela', color: '#D2996C' },
  { id: 'medium', label: 'Media', color: '#C68642' },
  { id: 'brown', label: 'Morena', color: '#A86B3C' },
  { id: 'deep', label: 'Oscura', color: '#8D5524' },
  { id: 'rich', label: 'Muy oscura', color: '#5C3A24' },
] as const

export const FACE_SHAPES = [
  { id: 'round', label: 'Redonda' },
  { id: 'oval', label: 'Ovalada' },
  { id: 'heart', label: 'Corazón' },
  { id: 'square', label: 'Cuadrada' },
] as const

export const EYE_SHAPES = [
  { id: 'round', label: 'Redondos' },
  { id: 'almond', label: 'Almendrados' },
  { id: 'wide', label: 'Grandes' },
  { id: 'soft', label: 'Suaves' },
] as const

export const EYE_COLORS = [
  { id: 'dark', label: 'Oscuros', color: '#2C241C' },
  { id: 'brown', label: 'Café', color: '#6B4423' },
  { id: 'hazel', label: 'Miel', color: '#8A6A3B' },
  { id: 'green', label: 'Verdes', color: '#3E7A4A' },
  { id: 'blue', label: 'Azules', color: '#3D7EA6' },
  { id: 'gray', label: 'Grises', color: '#6E7C88' },
] as const

export const BROW_SHAPES = [
  { id: 'soft', label: 'Suaves' },
  { id: 'straight', label: 'Rectas' },
  { id: 'arched', label: 'Arqueadas' },
  { id: 'thick', label: 'Gruesas' },
] as const

export const NOSE_SHAPES = [
  { id: 'button', label: 'Pequeña' },
  { id: 'narrow', label: 'Fina' },
  { id: 'wide', label: 'Ancha' },
] as const

export const MOUTH_SHAPES = [
  { id: 'smile', label: 'Sonrisa' },
  { id: 'grin', label: 'Grande' },
  { id: 'soft', label: 'Pequeña' },
  { id: 'open', label: 'Sorpresa' },
] as const

export const HAIR_STYLES = [
  { id: 'none', label: 'Sin cabello' },
  { id: 'buzz', label: 'Rapado' },
  { id: 'short', label: 'Corto' },
  { id: 'bob', label: 'Bob' },
  { id: 'long', label: 'Largo' },
  { id: 'wavy', label: 'Ondulado' },
  { id: 'curly', label: 'Rizado' },
  { id: 'afro', label: 'Afro' },
  { id: 'braids', label: 'Trenzas' },
  { id: 'ponytail', label: 'Cola' },
  { id: 'bun', label: 'Moño' },
  { id: 'pigtails', label: 'Coletas' },
] as const

export const HAIR_COLORS = [
  { id: 'black', label: 'Negro', color: '#1C1C1C' },
  { id: 'dark-brown', label: 'Castaño oscuro', color: '#3B2A1A' },
  { id: 'brown', label: 'Castaño', color: '#6B4423' },
  { id: 'light-brown', label: 'Castaño claro', color: '#A56B3C' },
  { id: 'blonde', label: 'Rubio', color: '#E6C36A' },
  { id: 'red', label: 'Rojizo', color: '#C45C26' },
  { id: 'gray', label: 'Canoso', color: '#8E8E8E' },
] as const

export const GLASSES = [
  { id: 'none', label: 'Sin lentes' },
  { id: 'round', label: 'Redondos' },
  { id: 'square', label: 'Cuadrados' },
] as const

export const ACCESSORIES = [
  { id: 'none', label: 'Sin accesorio' },
  { id: 'bow', label: 'Moño' },
  { id: 'cap', label: 'Gorra' },
  { id: 'flower', label: 'Flor' },
] as const

export const SHIRT_COLORS = [
  { id: 'teal', label: 'Verde agua', color: '#2BB7A9' },
  { id: 'coral', label: 'Coral', color: '#F07167' },
  { id: 'sun', label: 'Amarillo', color: '#F6C445' },
  { id: 'sky', label: 'Azul', color: '#5B8DEF' },
  { id: 'mint', label: 'Menta', color: '#7DDE92' },
  { id: 'pink', label: 'Rosa', color: '#F49AC2' },
  { id: 'ink', label: 'Azul marino', color: '#2C3E50' },
  { id: 'white', label: 'Blanco', color: '#F7F4EF' },
] as const

type IdOf<T extends readonly { id: string }[]> = T[number]['id']

export type AvatarLook = {
  skin: IdOf<typeof SKIN_TONES>
  face: IdOf<typeof FACE_SHAPES>
  eyes: IdOf<typeof EYE_SHAPES>
  eyeColor: IdOf<typeof EYE_COLORS>
  brows: IdOf<typeof BROW_SHAPES>
  nose: IdOf<typeof NOSE_SHAPES>
  mouth: IdOf<typeof MOUTH_SHAPES>
  hair: IdOf<typeof HAIR_STYLES>
  hairColor: IdOf<typeof HAIR_COLORS>
  freckles: boolean
  cheeks: boolean
  glasses: IdOf<typeof GLASSES>
  accessory: IdOf<typeof ACCESSORIES>
  shirt: IdOf<typeof SHIRT_COLORS>
}

function pickId<T extends readonly { id: string }[]>(options: T, value: unknown, fallback: T[number]['id']) {
  return options.some((item) => item.id === value) ? (value as T[number]['id']) : fallback
}

export function colorOf(options: readonly { id: string; color: string }[], id: string) {
  return options.find((item) => item.id === id)?.color ?? options[0]?.color ?? '#000'
}

export function defaultAvatarLook(): AvatarLook {
  return {
    skin: 'peach',
    face: 'round',
    eyes: 'round',
    eyeColor: 'brown',
    brows: 'soft',
    nose: 'button',
    mouth: 'smile',
    hair: 'bob',
    hairColor: 'dark-brown',
    freckles: false,
    cheeks: true,
    glasses: 'none',
    accessory: 'none',
    shirt: 'teal',
  }
}

export function sanitizeAvatarLook(value: unknown): AvatarLook | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (!SKIN_TONES.some((item) => item.id === raw.skin)) return null
  return {
    skin: pickId(SKIN_TONES, raw.skin, 'peach'),
    face: pickId(FACE_SHAPES, raw.face, 'round'),
    eyes: pickId(EYE_SHAPES, raw.eyes, 'round'),
    eyeColor: pickId(EYE_COLORS, raw.eyeColor, 'brown'),
    brows: pickId(BROW_SHAPES, raw.brows, 'soft'),
    nose: pickId(NOSE_SHAPES, raw.nose, 'button'),
    mouth: pickId(MOUTH_SHAPES, raw.mouth, 'smile'),
    hair: pickId(HAIR_STYLES, raw.hair, 'bob'),
    hairColor: pickId(HAIR_COLORS, raw.hairColor, 'dark-brown'),
    freckles: raw.freckles === true,
    cheeks: raw.cheeks !== false,
    glasses: pickId(GLASSES, raw.glasses, 'none'),
    accessory: pickId(ACCESSORIES, raw.accessory, 'none'),
    shirt: pickId(SHIRT_COLORS, raw.shirt, 'teal'),
  }
}

export function randomAvatarLook(): AvatarLook {
  const choice = <T extends { id: string }>(options: readonly T[]) =>
    options[Math.floor(Math.random() * options.length)]!.id
  return sanitizeAvatarLook({
    skin: choice(SKIN_TONES),
    face: choice(FACE_SHAPES),
    eyes: choice(EYE_SHAPES),
    eyeColor: choice(EYE_COLORS),
    brows: choice(BROW_SHAPES),
    nose: choice(NOSE_SHAPES),
    mouth: choice(MOUTH_SHAPES),
    hair: choice(HAIR_STYLES),
    hairColor: choice(HAIR_COLORS),
    freckles: Math.random() > 0.6,
    cheeks: Math.random() > 0.3,
    glasses: choice(GLASSES),
    accessory: choice(ACCESSORIES),
    shirt: choice(SHIRT_COLORS),
  }) ?? defaultAvatarLook()
}
