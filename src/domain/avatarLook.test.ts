import { describe, expect, it } from 'vitest'
import { defaultAvatarLook, HAIR_STYLES, randomAvatarLook, sanitizeAvatarLook, SKIN_TONES } from './avatarLook'

describe('avatarLook', () => {
  it('acepta un avatar completo y rechaza datos ajenos', () => {
    const look = defaultAvatarLook()
    expect(sanitizeAvatarLook(look)?.hair).toBe('bob')
    expect(sanitizeAvatarLook({ skin: 'no-existe' })).toBeNull()
    expect(sanitizeAvatarLook({ skin: 'peach' })?.face).toBe('round')
    expect(sanitizeAvatarLook(null)).toBeNull()
  })

  it('el azar se queda dentro de las características', () => {
    const look = randomAvatarLook()
    expect(SKIN_TONES.some((item) => item.id === look.skin)).toBe(true)
    expect(HAIR_STYLES.some((item) => item.id === look.hair)).toBe(true)
  })
})