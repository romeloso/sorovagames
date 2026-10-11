import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { APP_CONFIG } from '@/config/app'
import { seedAvatarLibraryItems } from '@/config/avatars'
import { ADMIN_CONFIG, PROFILE_SEEDS } from '@/config/profiles'
import { SEED_PASSAGES, SEED_TOPICS, SEED_WORDS } from '@/data/content/seed'
import { evaluateAchievements } from '@/data/achievements'
import { getAvailableReadingLevels } from '@/data/games/reading/levels'
import { TYPING_LEVELS } from '@/data/games/typing/levels'
import { getWordSearchLevels } from '@/data/games/wordsearch/levels'
import { evaluateAdaptiveDifficulty } from '@/domain/adaptive'
import { applyLessonResult, syncGameProgressWithLevels } from '@/domain/progress'
import { computeLessonRewards } from '@/domain/rewards'
import { ageFromBirthDate } from '@/lib/age'
import { effectiveLearningAge, parseSchoolGrade } from '@/lib/grade'
import { consumeRateLimit } from '@/lib/rateLimit'
import type { SchoolGrade } from '@/types'
import { invalidateContentCaches } from '@/services/cache/contentCache'
import {
  createAdminPassage,
  createAdminWord,
  createAvatarLibraryItem,
  createStudyTopic,
} from '@/services/contentService'
import {
  APP_STATE_VERSION,
  createChildProfile,
  createDefaultProgressForChild,
  createInitialAppState,
  emptyContentBank,
} from '@/services/profileFactory'
import { localAppStore } from '@/services/storage/localStore'
import { loadRemoteState, saveRemoteState } from '@/services/storage/remoteStore'
import { soundService } from '@/services/soundService'
import type {
  AdaptiveHint,
  AdminPassageItem,
  AdminWordItem,
  AppState,
  AvatarLibraryItem,
  ChildProfile,
  ColorTheme,
  ContentBank,
  GameId,
  GameProgress,
  LessonSessionResult,
  RewardPayload,
  SessionRole,
  StudyTopic,
} from '@/types'

interface CompleteLessonResponse {
  reward: RewardPayload
  adaptive: AdaptiveHint
}

interface AppContextValue {
  ready: boolean
  state: AppState
  activeProfile: ChildProfile | null
  isAdmin: boolean
  selectProfile: (profileId: string) => void
  clearActiveProfile: () => void
  loginAdmin: (pin: string) => { ok: boolean; error?: string }
  logoutAdmin: () => void
  toggleSound: () => void
  toggleTheme: () => void
  getGameProgress: (gameId: GameId, profileId?: string) => GameProgress | null
  completeLesson: (result: LessonSessionResult) => CompleteLessonResponse | null
  resetAllProgress: () => void
  playSound: (name: 'correct' | 'wrong' | 'reward' | 'levelup') => void
  addChildProfile: (input: {
    name: string
    birthDate?: string | null
    grade?: SchoolGrade | null
    avatarImage?: string
    accent?: string
  }) => ChildProfile
  updateChildProfile: (
    profileId: string,
    patch: Partial<Pick<ChildProfile, 'name' | 'birthDate' | 'grade' | 'avatarImage' | 'accent'>>,
  ) => void
  removeChildProfile: (profileId: string) => void
  addWordMaterial: (input: {
    word: string
    image?: string
    clue?: string
    distractors: string[]
    minAge?: number
    maxAge?: number
    minGrade?: number
    maxGrade?: number
  }) => AdminWordItem
  addPassageMaterial: (input: {
    title: string
    text: string
    question: string
    options: string[]
    answer: string
    minAge?: number
    maxAge?: number
    minGrade?: number
    maxGrade?: number
  }) => AdminPassageItem
  removeWordMaterial: (id: string) => void
  removePassageMaterial: (id: string) => void
  addStudyTopic: (input: {
    subjectId: GameId
    title: string
    description: string
    minAge?: number
    maxAge?: number
    minGrade?: number
    maxGrade?: number
    reinforce?: boolean
  }) => StudyTopic
  removeStudyTopic: (id: string) => void
  addAvatarToLibrary: (input: { label: string; src: string }) => AvatarLibraryItem
  removeAvatarFromLibrary: (id: string) => void
  updateProfileAvatar: (profileId: string, avatarImage: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function parseTheme(value: unknown): ColorTheme {
  return value === 'light' ? 'light' : 'dark'
}

/** Rellena colecciones vacías solo al pasar a la versión 4. */
function seedEmptyCollections(bank: ContentBank, previousVersion: number): ContentBank {
  if (previousVersion >= APP_STATE_VERSION) return bank
  return {
    ...bank,
    words: bank.words.length > 0 ? bank.words : SEED_WORDS,
    passages: bank.passages.length > 0 ? bank.passages : SEED_PASSAGES,
    topics: bank.topics.length > 0 ? bank.topics : SEED_TOPICS,
  }
}

function migrateState(raw: AppState | null): AppState {
  const base = createInitialAppState(APP_CONFIG.defaultSoundEnabled)
  if (!raw) return base

  const profiles = { ...base.profiles }
  for (const [id, profile] of Object.entries(raw.profiles ?? {})) {
    const seed = PROFILE_SEEDS.find((item) => item.id === id)
    const savedAvatar = profile.avatarImage
    const isCustomUpload = typeof savedAvatar === 'string' && savedAvatar.startsWith('data:')
    const isPhotoOrCartoon =
      typeof savedAvatar === 'string' &&
      (savedAvatar.includes('/avatars/photo/') ||
        savedAvatar.includes('/avatars/cartoon/') ||
        savedAvatar.startsWith('data:'))

    profiles[id] = {
      ...(profiles[id] ?? createChildProfile({ name: profile.name || id })),
      ...profile,
      birthDate: profile.birthDate ?? seed?.birthDate ?? null,
      grade: parseSchoolGrade(profile.grade ?? seed?.grade ?? null),
      avatarImage:
        isCustomUpload || isPhotoOrCartoon
          ? savedAvatar
          : (seed?.avatarImage ?? `/avatars/photo/${id}-1.jpg`),
      accent: profile.accent ?? seed?.accent ?? '#6366F1',
    }
  }

  const existingLibrary = raw.contentBank?.avatarLibrary ?? []
  const avatarLibrary =
    existingLibrary.length > 0
      ? existingLibrary
      : seedAvatarLibraryItems().map((item) => createAvatarLibraryItem(item))

  const contentBank = {
    ...emptyContentBank(),
    ...raw.contentBank,
    words: (raw.contentBank?.words ?? []).map((item) => ({
      ...item,
      minAge: item.minAge ?? 3,
      maxAge: item.maxAge ?? 12,
      minGrade: item.minGrade ?? 0,
      maxGrade: item.maxGrade ?? 6,
    })),
    passages: (raw.contentBank?.passages ?? []).map((item) => ({
      ...item,
      minAge: item.minAge ?? 3,
      maxAge: item.maxAge ?? 12,
      minGrade: item.minGrade ?? 0,
      maxGrade: item.maxGrade ?? 6,
    })),
    topics: (raw.contentBank?.topics ?? []).map((item) => ({
      ...item,
      minGrade: item.minGrade ?? 0,
      maxGrade: item.maxGrade ?? 6,
    })),
    avatarLibrary,
  }
  const seededBank = seedEmptyCollections(contentBank, raw.version ?? 0)

  const readingLevels = getAvailableReadingLevels(seededBank)
  const typingLevels = TYPING_LEVELS.filter((level) => level.lessonIds.length > 0)
  const wordsearchLevels = getWordSearchLevels()

  const progressEntries = Object.entries(raw.progress ?? {}).map(([childId, games]) => {
    const defaults = createDefaultProgressForChild(seededBank)
    const merged = { ...defaults, ...games } as Record<GameId, GameProgress>
    if (merged.reading) {
      merged.reading = syncGameProgressWithLevels(merged.reading, readingLevels)
    }
    if (merged.typing) {
      merged.typing = syncGameProgressWithLevels(merged.typing, typingLevels)
    }
    if (merged.wordsearch) {
      merged.wordsearch = syncGameProgressWithLevels(merged.wordsearch, wordsearchLevels)
    } else {
      merged.wordsearch = defaults.wordsearch
    }
    return [childId, merged] as const
  })

  return {
    ...base,
    ...raw,
    version: APP_STATE_VERSION,
    theme: parseTheme(raw.theme),
    sessionRole: (raw.sessionRole as SessionRole | undefined) ?? 'child',
    contentBank: seededBank,
    profiles,
    progress: {
      ...base.progress,
      ...Object.fromEntries(progressEntries),
    },
  }
}

function syncReadingProgress(prev: AppState, contentBank: AppState['contentBank']): AppState['progress'] {
  const readingLevels = getAvailableReadingLevels(contentBank)
  return Object.fromEntries(
    Object.entries(prev.progress).map(([childId, games]) => [
      childId,
      {
        ...games,
        reading: syncGameProgressWithLevels(games.reading, readingLevels),
      },
    ]),
  )
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => createInitialAppState())
  const [ready, setReady] = useState(false)
  const [recentResults, setRecentResults] = useState<LessonSessionResult[]>([])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const remote = await loadRemoteState()
      const loaded = migrateState(remote ?? localAppStore.load())
      if (cancelled) return
      setState(loaded)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    localAppStore.save(state)
    saveRemoteState(state)
  }, [state, ready])

  useEffect(() => {
    if (!ready) return
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
    document.documentElement.style.colorScheme = state.theme
  }, [ready, state.theme])

  const activeProfile = useMemo(() => {
    if (!state.activeProfileId) return null
    return state.profiles[state.activeProfileId] ?? null
  }, [state.activeProfileId, state.profiles])

  const isAdmin = state.sessionRole === 'admin'

  const selectProfile = useCallback((profileId: string) => {
    setState((prev) => ({
      ...prev,
      activeProfileId: profileId,
      sessionRole: 'child',
    }))
  }, [])

  const clearActiveProfile = useCallback(() => {
    setState((prev) => ({ ...prev, activeProfileId: null, sessionRole: 'child' }))
  }, [])

  const loginAdmin = useCallback((pin: string) => {
    const limit = consumeRateLimit('adminPin')
    if (!limit.allowed) {
      return {
        ok: false,
        error: limit.reason ?? 'Demasiados intentos. Espera un momento.',
      }
    }
    if (pin.trim() !== ADMIN_CONFIG.pin) {
      return { ok: false, error: 'PIN incorrecto. Inténtalo de nuevo.' }
    }
    setState((prev) => ({
      ...prev,
      sessionRole: 'admin',
      activeProfileId: null,
    }))
    return { ok: true }
  }, [])

  const logoutAdmin = useCallback(() => {
    setState((prev) => ({ ...prev, sessionRole: 'child' }))
  }, [])

  const toggleSound = useCallback(() => {
    setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
  }, [])

  const toggleTheme = useCallback(() => {
    setState((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))
  }, [])

  const playSound = useCallback(
    (name: 'correct' | 'wrong' | 'reward' | 'levelup') => {
      void soundService.play(name, state.soundEnabled)
    },
    [state.soundEnabled],
  )

  const getGameProgress = useCallback(
    (gameId: GameId, profileId?: string) => {
      const id = profileId ?? state.activeProfileId
      if (!id) return null
      return state.progress[id]?.[gameId] ?? null
    },
    [state.activeProfileId, state.progress],
  )

  const completeLesson = useCallback(
    (result: LessonSessionResult): CompleteLessonResponse | null => {
      if (!state.activeProfileId) return null
      const profile = state.profiles[state.activeProfileId]
      const childProgress = state.progress[state.activeProfileId]
      if (!profile || !childProgress) return null

      const age = effectiveLearningAge(ageFromBirthDate(profile.birthDate), profile.grade)
      const grade = profile.grade
      const levels =
        result.gameId === 'reading'
          ? getAvailableReadingLevels(state.contentBank, age, grade)
          : result.gameId === 'typing'
            ? TYPING_LEVELS.filter((level) => level.lessonIds.length > 0)
            : result.gameId === 'wordsearch'
              ? getWordSearchLevels(age, grade)
              : []

      const currentGameProgress = childProgress[result.gameId]
      const nextGameProgress = applyLessonResult(currentGameProgress, levels, [], result)

      const achievements = evaluateAchievements({
        profile,
        reading: result.gameId === 'reading' ? nextGameProgress : childProgress.reading,
        typing: result.gameId === 'typing' ? nextGameProgress : childProgress.typing,
        result,
      })

      const { profile: nextProfile, reward } = computeLessonRewards(profile, result, achievements)

      setState((prev) => ({
        ...prev,
        profiles: {
          ...prev.profiles,
          [profile.id]: nextProfile,
        },
        progress: {
          ...prev.progress,
          [profile.id]: {
            ...prev.progress[profile.id],
            [result.gameId]: nextGameProgress,
          } as Record<GameId, GameProgress>,
        },
      }))

      const nextRecent = [...recentResults, result].slice(-5)
      setRecentResults(nextRecent)

      if (reward.leveledUp) {
        void soundService.play('levelup', state.soundEnabled)
      } else {
        void soundService.play('reward', state.soundEnabled)
      }

      return {
        reward,
        adaptive: evaluateAdaptiveDifficulty(nextRecent),
      }
    },
    [
      recentResults,
      state.activeProfileId,
      state.contentBank,
      state.profiles,
      state.progress,
      state.soundEnabled,
    ],
  )

  const resetAllProgress = useCallback(() => {
    const fresh = createInitialAppState(state.soundEnabled, state.theme)
    setState({
      ...fresh,
      contentBank: state.contentBank,
      profiles: Object.fromEntries(
        Object.values(state.profiles).map((profile) => [
          profile.id,
          {
            ...profile,
            level: 1,
            xp: 0,
            points: 0,
            coins: 0,
            streakDays: 0,
            lastPlayedDate: null,
            achievements: [],
            updatedAt: new Date().toISOString(),
          },
        ]),
      ),
      progress: Object.fromEntries(
        Object.keys(state.profiles).map((id) => [id, createDefaultProgressForChild(state.contentBank)]),
      ),
    })
    setRecentResults([])
  }, [state.contentBank, state.profiles, state.soundEnabled, state.theme])

  const addChildProfile = useCallback(
    (input: {
      name: string
      birthDate?: string | null
      grade?: SchoolGrade | null
      avatarImage?: string
      accent?: string
    }) => {
      const limit = consumeRateLimit('addChild')
      if (!limit.allowed) {
        throw new Error(limit.reason ?? 'Límite de altas alcanzado')
      }
      const profile = createChildProfile(input)
      setState((prev) => ({
        ...prev,
        profiles: { ...prev.profiles, [profile.id]: profile },
        progress: {
          ...prev.progress,
          [profile.id]: createDefaultProgressForChild(prev.contentBank),
        },
      }))
      return profile
    },
    [],
  )

  const updateChildProfile = useCallback(
    (
      profileId: string,
      patch: Partial<Pick<ChildProfile, 'name' | 'birthDate' | 'grade' | 'avatarImage' | 'accent'>>,
    ) => {
      setState((prev) => {
        const profile = prev.profiles[profileId]
        if (!profile) return prev
        return {
          ...prev,
          profiles: {
            ...prev.profiles,
            [profileId]: {
              ...profile,
              ...patch,
              name: patch.name?.trim() || profile.name,
              updatedAt: new Date().toISOString(),
            },
          },
        }
      })
    },
    [],
  )

  const removeChildProfile = useCallback((profileId: string) => {
    setState((prev) => {
      const profiles = { ...prev.profiles }
      const progress = { ...prev.progress }
      delete profiles[profileId]
      delete progress[profileId]
      return {
        ...prev,
        profiles,
        progress,
        activeProfileId:
          prev.activeProfileId === profileId ? null : prev.activeProfileId,
      }
    })
  }, [])

  const addWordMaterial = useCallback(
    (input: {
      word: string
      image?: string
      clue?: string
      distractors: string[]
      minAge?: number
      maxAge?: number
      minGrade?: number
      maxGrade?: number
    }) => {
      const limit = consumeRateLimit('addContent')
      if (!limit.allowed) {
        throw new Error(limit.reason ?? 'Límite de contenido alcanzado')
      }
      const item = createAdminWord(input)
      setState((prev) => {
        const contentBank = {
          ...prev.contentBank,
          words: [item, ...prev.contentBank.words],
        }
        return { ...prev, contentBank, progress: syncReadingProgress(prev, contentBank) }
      })
      return item
    },
    [],
  )

  const addPassageMaterial = useCallback(
    (input: {
      title: string
      text: string
      question: string
      options: string[]
      answer: string
      minAge?: number
      maxAge?: number
      minGrade?: number
      maxGrade?: number
    }) => {
      const limit = consumeRateLimit('addContent')
      if (!limit.allowed) {
        throw new Error(limit.reason ?? 'Límite de contenido alcanzado')
      }
      const item = createAdminPassage(input)
      setState((prev) => {
        const contentBank = {
          ...prev.contentBank,
          passages: [item, ...prev.contentBank.passages],
        }
        return { ...prev, contentBank, progress: syncReadingProgress(prev, contentBank) }
      })
      return item
    },
    [],
  )

  const removeWordMaterial = useCallback((id: string) => {
    invalidateContentCaches()
    setState((prev) => ({
      ...prev,
      contentBank: {
        ...prev.contentBank,
        words: prev.contentBank.words.filter((item) => item.id !== id),
      },
    }))
  }, [])

  const removePassageMaterial = useCallback((id: string) => {
    invalidateContentCaches()
    setState((prev) => ({
      ...prev,
      contentBank: {
        ...prev.contentBank,
        passages: prev.contentBank.passages.filter((item) => item.id !== id),
      },
    }))
  }, [])

  const addStudyTopic = useCallback(
    (input: {
      subjectId: GameId
      title: string
      description: string
      minAge?: number
      maxAge?: number
      minGrade?: number
      maxGrade?: number
      reinforce?: boolean
    }) => {
      const limit = consumeRateLimit('addContent')
      if (!limit.allowed) {
        throw new Error(limit.reason ?? 'Límite de contenido alcanzado')
      }
      const item = createStudyTopic(input)
      setState((prev) => ({
        ...prev,
        contentBank: {
          ...prev.contentBank,
          topics: [item, ...prev.contentBank.topics],
        },
      }))
      return item
    },
    [],
  )

  const removeStudyTopic = useCallback((id: string) => {
    invalidateContentCaches()
    setState((prev) => ({
      ...prev,
      contentBank: {
        ...prev.contentBank,
        topics: prev.contentBank.topics.filter((item) => item.id !== id),
      },
    }))
  }, [])

  const addAvatarToLibrary = useCallback((input: { label: string; src: string }) => {
    const limit = consumeRateLimit('avatarUpload')
    if (!limit.allowed) {
      throw new Error(limit.reason ?? 'Límite de subidas alcanzado')
    }
    const item = createAvatarLibraryItem(input)
    setState((prev) => ({
      ...prev,
      contentBank: {
        ...prev.contentBank,
        avatarLibrary: [item, ...prev.contentBank.avatarLibrary],
      },
    }))
    return item
  }, [])

  const removeAvatarFromLibrary = useCallback((id: string) => {
    invalidateContentCaches()
    setState((prev) => ({
      ...prev,
      contentBank: {
        ...prev.contentBank,
        avatarLibrary: prev.contentBank.avatarLibrary.filter((item) => item.id !== id),
      },
    }))
  }, [])

  const updateProfileAvatar = useCallback((profileId: string, avatarImage: string) => {
    setState((prev) => {
      const profile = prev.profiles[profileId]
      if (!profile) return prev
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [profileId]: {
            ...profile,
            avatarImage,
            updatedAt: new Date().toISOString(),
          },
        },
      }
    })
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      state,
      activeProfile,
      isAdmin,
      selectProfile,
      clearActiveProfile,
      loginAdmin,
      logoutAdmin,
      toggleSound,
      toggleTheme,
      getGameProgress,
      completeLesson,
      resetAllProgress,
      playSound,
      addChildProfile,
      updateChildProfile,
      removeChildProfile,
      addWordMaterial,
      addPassageMaterial,
      removeWordMaterial,
      removePassageMaterial,
      addStudyTopic,
      removeStudyTopic,
      addAvatarToLibrary,
      removeAvatarFromLibrary,
      updateProfileAvatar,
    }),
    [
      ready,
      state,
      activeProfile,
      isAdmin,
      selectProfile,
      clearActiveProfile,
      loginAdmin,
      logoutAdmin,
      toggleSound,
      toggleTheme,
      getGameProgress,
      completeLesson,
      resetAllProgress,
      playSound,
      addChildProfile,
      updateChildProfile,
      removeChildProfile,
      addWordMaterial,
      addPassageMaterial,
      removeWordMaterial,
      removePassageMaterial,
      addStudyTopic,
      removeStudyTopic,
      addAvatarToLibrary,
      removeAvatarFromLibrary,
      updateProfileAvatar,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useApp debe usarse dentro de AppProvider')
  }
  return ctx
}
