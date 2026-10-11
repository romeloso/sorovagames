import { defaultAvatarFor } from '@/config/avatars'
import type { ChildProfileSeed } from '@/types'

/** Tutor de demostración. El superadministrador puede desactivarlo o crear otros. */
export const DEMO_TUTOR = {
  id: 'tutor-sorova',
  name: 'Familia Sorova',
  accessCode: 'FAMILIASOROVA',
} as const

/** Semilla inicial. El niño entra con nombre + fecha, no eligiendo la tarjeta. */
export const PROFILE_SEEDS: ChildProfileSeed[] = [
  {
    id: 'isabella',
    name: 'Isabella',
    avatar: '🦊',
    avatarImage: defaultAvatarFor('isabella'),
    accent: '#EC4899',
    birthDate: '2016-03-15',
    grade: null,
  },
  {
    id: 'sophia',
    name: 'Sophia',
    avatar: '🐰',
    avatarImage: defaultAvatarFor('sophia'),
    accent: '#F59E0B',
    birthDate: '2017-12-04',
    grade: null,
  },
  {
    id: 'valentina',
    name: 'Valentina',
    avatar: '🐱',
    avatarImage: defaultAvatarFor('valentina'),
    accent: '#3B82F6',
    birthDate: '2018-07-22',
    grade: null,
  },
]

export const ACCENT_PALETTE = [
  '#EC4899',
  '#6366F1',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#FDE047',
] as const

/** Acceso del superadministrador. Cada tutor tiene su propio código. */
export const ADMIN_CONFIG = {
  roleLabel: 'Superadministrador',
  /** PIN del superadministrador en esta instalación. */
  pin: '4716',
} as const
