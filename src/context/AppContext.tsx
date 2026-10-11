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
import { evaluateAchievements } from '@/data/achievements'
import { getAvailableReadingLevels } from '@/data/games/reading/levels'
import { TYPING_LEVELS } from '@/data/games/typing/levels'
import { getWordSearchLevels } from '@/data/games/wordsearch/levels'
import { getSubjectLevels, SUBJECT_GAME_IDS } from '@/data/subjects/catalog'
import { evaluateAdaptiveDifficulty } from '@/domain/adaptive'
import { READING_WORLD_ORDER } from '@/domain/reading/placement'
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
  GameId,
  GameProgress,
  LessonSessionResult,
  ReadingPlacement,
  ReadingStats,
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
  getGameProgress: (gameId: GameId, profileId?: string) => GameProgress | null
  completeLesson: (result: LessonSessionResult) => CompleteLessonResponse | null
  saveReadingPlacement: (placement: ReadingPlacement) => void
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

  const readingLevels = getAvailableReadingLevels(contentBank)
  const typingLevels = TYPING_LEVELS.filter((level) => level.lessonIds.length > 0)
  const wordsearchLevels = getWordSearchLevels()

  const progressEntries = Object.entries(raw.progress ?? {}).map(([childId, games]) => {
    const defaults = createDefaultProgressForChild(contentBank)
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
    for (const subjectId of SUBJECT_GAME_IDS) {
      merged[subjectId] = syncGameProgressWithLevels(
        merged[subjectId] ?? defaults[subjectId],
        getSubjectLevels(subjectId),
      )
    }
    return [childId, merged] as const
  })

  return {
    ...base,
    ...raw,
    version: 3,
    sessionRole: (raw.sessionRole as SessionRole | undefined) ?? 'child',
    contentBank,
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
              : getSubjectLevels(result.gameId)

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

  const saveReadingPlacement = useCallback((placement: ReadingPlacement) => {
    setState((prev) => {
      const profileId = prev.activeProfileId
      if (!profileId) return prev
      const child = prev.progress[profileId]
      const reading = child?.reading
      if (!child || !reading) return prev
      const age = effectiveLearningAge(
        ageFromBirthDate(prev.profiles[profileId]?.birthDate),
        prev.profiles[profileId]?.grade ?? null,
      )
      const levels = getAvailableReadingLevels(prev.contentBank, age, prev.profiles[profileId]?.grade ?? null)
      const targetIndex = Math.max(
        0,
        READING_WORLD_ORDER.indexOf(placement.recommendedWorldId as (typeof READING_WORLD_ORDER)[number]),
      )
      const unlocked = new Set(reading.unlockedLevelIds)
      const lessonProgress = { ...reading.lessonProgress }
      for (const level of levels) {
        const orderIndex = READING_WORLD_ORDER.indexOf(level.id as (typeof READING_WORLD_ORDER)[number])
        if (orderIndex < 0 || orderIndex > targetIndex) continue
        unlocked.add(level.id)
        for (const lessonId of level.lessonIds) {
          const existing = lessonProgress[lessonId]
          if (!existing) continue
          const firstOfWorld = level.lessonIds[0] === lessonId
          lessonProgress[lessonId] = {
            ...existing,
            unlocked: existing.unlocked || firstOfWorld || orderIndex < targetIndex,
          }
        }
      }
      const stats: ReadingStats = { ...(reading.stats as ReadingStats), placement }
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [profileId]: {
            ...child,
            reading: {
              ...reading,
              unlockedLevelIds: [...unlocked],
              lessonProgress,
              stats,
            },
          },
        },
      }
    })
  }, [])

  const resetAllProgress = useCallback(() => {
    const fresh = createInitialAppState(state.soundEnabled)
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
  }, [state.contentBank, state.profiles, state.soundEnabled])

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
      getGameProgress,
      completeLesson,
      saveReadingPlacement,
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
      getGameProgress,
      completeLesson,
      saveReadingPlacement,
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
