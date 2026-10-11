import { ACCENT_PALETTE, PROFILE_SEEDS } from '@/config/profiles'
import { defaultAvatarFor, seedAvatarLibraryItems } from '@/config/avatars'
import { SEED_PASSAGES, SEED_TOPICS, SEED_WORDS } from '@/data/content/seed'
import { createInitialGameProgress } from '@/domain/progress'
import { getAvailableReadingLevels } from '@/data/games/reading/levels'
import { TYPING_LEVELS } from '@/data/games/typing/levels'
import { getWordSearchLevels } from '@/data/games/wordsearch/levels'
import { createAvatarLibraryItem } from '@/services/contentService'
import type {
  AppState,
  ChildProfile,
  ColorTheme,
  ContentBank,
  GameId,
  GameProgress,
  SchoolGrade,
} from '@/types'

export const APP_STATE_VERSION = 4

function nowIso() {
  return new Date().toISOString()
}

export function emptyContentBank(): ContentBank {
  return { words: [], passages: [], topics: [], avatarLibrary: [] }
}

export function createProfileFromSeed(seed: (typeof PROFILE_SEEDS)[number]): ChildProfile {
  return {
    ...seed,
    birthDate: seed.birthDate ?? null,
    grade: seed.grade ?? null,
    level: 1,
    xp: 0,
    points: 0,
    coins: 0,
    streakDays: 0,
    lastPlayedDate: null,
    achievements: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

export function createChildProfile(input: {
  name: string
  birthDate?: string | null
  grade?: SchoolGrade | null
  avatarImage?: string
  accent?: string
}): ChildProfile {
  const id = `child-${crypto.randomUUID().slice(0, 8)}`
  const accent =
    input.accent ??
    ACCENT_PALETTE[Math.floor(Math.random() * ACCENT_PALETTE.length)] ??
    '#6366F1'

  return {
    id,
    name: input.name.trim(),
    avatar: '⭐',
    avatarImage: input.avatarImage ?? defaultAvatarFor('isabella'),
    accent,
    birthDate: input.birthDate ?? null,
    grade: input.grade ?? null,
    level: 1,
    xp: 0,
    points: 0,
    coins: 0,
    streakDays: 0,
    lastPlayedDate: null,
    achievements: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

export function createDefaultProgressForChild(
  contentBank: ContentBank = emptyContentBank(),
): Record<GameId, GameProgress> {
  return {
    reading: createInitialGameProgress('reading', getAvailableReadingLevels(contentBank)),
    typing: createInitialGameProgress(
      'typing',
      TYPING_LEVELS.filter((level) => level.lessonIds.length > 0),
    ),
    wordsearch: createInitialGameProgress('wordsearch', getWordSearchLevels()),
    memory: createInitialGameProgress('memory', []),
    math: createInitialGameProgress('math', []),
    science: createInitialGameProgress('science', []),
    english: createInitialGameProgress('english', []),
    creativity: createInitialGameProgress('creativity', []),
  }
}

export function createInitialAppState(soundEnabled = true, theme: ColorTheme = 'dark'): AppState {
  const profiles: Record<string, ChildProfile> = {}
  const progress: AppState['progress'] = {}
  const contentBank: ContentBank = {
    words: SEED_WORDS,
    passages: SEED_PASSAGES,
    topics: SEED_TOPICS,
    avatarLibrary: seedAvatarLibraryItems().map((item) => createAvatarLibraryItem(item)),
  }

  for (const seed of PROFILE_SEEDS) {
    profiles[seed.id] = createProfileFromSeed(seed)
    progress[seed.id] = createDefaultProgressForChild(contentBank)
  }

  return {
    version: APP_STATE_VERSION,
    soundEnabled,
    theme,
    activeProfileId: null,
    sessionRole: 'child',
    profiles,
    progress,
    contentBank,
  }
}
