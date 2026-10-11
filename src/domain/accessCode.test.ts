import { describe, expect, it } from 'vitest'
import {
  childAccessCode,
  createTutorAccessCode,
  normalizeAccessCode,
  normalizeSessionRole,
  removeTutorAccount,
} from './accessCode'

describe('código de acceso del niño', () => {
  it('une el nombre y la fecha como día, mes y año', () => {
    expect(childAccessCode('Sophia', '2017-12-04')).toBe('SOPHIA041217')
    expect(childAccessCode('María José', '2018-01-09')).toBe('MARIAJOSE090118')
    expect(childAccessCode('Elena', '2018-08-20')).toBe('ELENA200818')
  })

  it('no inventa un código sin fecha o sin letras', () => {
    expect(childAccessCode('Sophia', null)).toBeNull()
    expect(childAccessCode('123', '2017-12-04')).toBeNull()
  })

  it('acepta el código escrito con espacios o minúsculas', () => {
    expect(normalizeAccessCode(' sophia 041217 ')).toBe('SOPHIA041217')
  })

  it('trata el acceso administrador anterior como superadministrador', () => {
    expect(normalizeSessionRole('admin')).toBe('superadmin')
    expect(normalizeSessionRole('tutor')).toBe('tutor')
  })

  it('genera un código de tutor que no repite los que ya existen', () => {
    const taken = new Set(['CASA1000'])
    const code = createTutorAccessCode('Casa', taken)
    expect(code.startsWith('CASA')).toBe(true)
    expect(taken.has(code)).toBe(false)
  })
})

describe('eliminar cuenta de tutor', () => {
  const tutor = (id: string, name: string) => ({
    id,
    name,
    accessCode: id.toUpperCase(),
    active: true,
    createdAt: '',
  })

  const base = {
    sessionRole: 'superadmin' as const,
    activeProfileId: 'sofia',
    activeTutorId: 'tutor-ana',
    tutors: {
      'tutor-ana': tutor('tutor-ana', 'Ana'),
      'tutor-beto': tutor('tutor-beto', 'Beto'),
    },
    profiles: {
      sofia: { id: 'sofia', tutorId: 'tutor-ana' },
      leo: { id: 'leo', tutorId: 'tutor-beto' },
      libre: { id: 'libre', tutorId: null },
    },
    progress: {
      sofia: { reading: { lessons: 1 } },
      leo: { reading: { lessons: 2 } },
      libre: { reading: { lessons: 0 } },
    },
  }

  it('borra la cuenta y los perfiles a su cargo', () => {
    const next = removeTutorAccount(base, 'tutor-ana')
    expect(next.tutors['tutor-ana']).toBeUndefined()
    expect(next.tutors['tutor-beto']?.name).toBe('Beto')
    expect(next.profiles.sofia).toBeUndefined()
    expect(next.progress.sofia).toBeUndefined()
    expect(next.profiles.leo?.tutorId).toBe('tutor-beto')
    expect(next.profiles.libre?.id).toBe('libre')
    expect(next.progress.leo).toEqual({ reading: { lessons: 2 } })
    expect(next.activeProfileId).toBeNull()
    expect(next.activeTutorId).toBeNull()
  })

  it('deja el estado igual si no es el superadministrador', () => {
    const tutorState = { ...base, sessionRole: 'tutor' as const }
    expect(removeTutorAccount(tutorState, 'tutor-ana')).toBe(tutorState)
  })
})