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
import { ADMIN_CONFIG, DEMO_TUTOR, PROFILE_SEEDS } from '@/config/profiles'
import {
  canManageProfiles,
  childAccessCode,
  createTutorAccessCode,
  normalizeAccessCode,
  normalizeSessionRole,
  ownsChild,
  removeTutorAccount,
} from '@/domain/accessCode'
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
  TutorAccount,
} from '@/types'

interface CompleteLessonResponse {
  reward: RewardPayload
  adaptive: AdaptiveHint
}

interface AppContextValue {
  ready: boolean
  state: AppState
  activeProfile: ChildProfile | null
  sessionRole: SessionRole
  isTutor: boolean
  isSuperadmin: boolean
  canManage: boolean
  selectProfile: (profileId: string) => void
  clearActiveProfile: () => void
  loginChild: (code: string) => { ok: boolean; error?: string }
  loginTutor: (code: string) => { ok: boolean; error?: string }
  loginSuperadmin: (pin: string) => { ok: boolean; error?: string }
  logoutStaff: () => void
  addTutor: (name: string) => TutorAccount
  setTutorActive: (tutorId: string, active: boolean) => void
  regenerateTutorCode: (tutorId: string) => string | null
  removeTutor: (tutorId: string) => {
    ok: boolean
    error?: string
    name?: string
    removedChildren?: number
    removedChildIds?: string[]
  }
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
    tutorId?: string | null
  }) => ChildProfile
  updateChildProfile: (
    profileId: string,
    patch: Partial<Pick<ChildProfile, 'name' | 'birthDate' | 'grade' | 'avatarImage' | 'accent' | 'tutorId'>>,
  ) => { ok: boolean; error?: string }
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

    const birthDate = profile.birthDate !== undefined ? profile.birthDate : (seed?.birthDate ?? null)
    const name = profile.name || seed?.name || id
    profiles[id] = {
      ...(profiles[id] ?? createChildProfile({ name, birthDate, tutorId: seed ? DEMO_TUTOR.id : null })),
      ...profile,
      name,
      birthDate,
      tutorId: profile.tutorId !== undefined ? profile.tutorId : seed ? DEMO_TUTOR.id : null,
      accessCode: childAccessCode(name, birthDate),
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
    sessionRole: normalizeSessionRole(raw.sessionRole),
    activeTutorId: raw.activeTutorId ?? null,
    tutors: {
      ...base.tutors,
      ...(raw.tutors ?? {}),
    },
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

  const isTutor = state.sessionRole === 'tutor'
  const isSuperadmin = state.sessionRole === 'superadmin'
  const canManage = canManageProfiles(state.sessionRole)

  const selectProfile = useCallback((profileId: string) => {
    setState((prev) => ({
      ...prev,
      activeProfileId: profileId,
      activeTutorId: null,
      sessionRole: 'child',
    }))
  }, [])

  const clearActiveProfile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeProfileId: null,
      activeTutorId: null,
      sessionRole: 'child',
    }))
  }, [])

  const loginChild = useCallback((code: string) => {
    const limit = consumeRateLimit('adminPin')
    if (!limit.allowed) {
      return { ok: false, error: limit.reason ?? 'Demasiados intentos. Espera un momento.' }
    }
    const normalized = normalizeAccessCode(code)
    const profile = Object.values(state.profiles).find((item) => item.accessCode === normalized)
    if (!profile) {
      return { ok: false, error: 'No encontramos ese código. Pídeselo a tu tutor.' }
    }
    setState((prev) => ({
      ...prev,
      activeProfileId: profile.id,
      activeTutorId: null,
      sessionRole: 'child',
    }))
    return { ok: true }
  }, [state.profiles])

  const loginTutor = useCallback((code: string) => {
    const limit = consumeRateLimit('adminPin')
    if (!limit.allowed) {
      return { ok: false, error: limit.reason ?? 'Demasiados intentos. Espera un momento.' }
    }
    const normalized = normalizeAccessCode(code)
    const tutor = Object.values(state.tutors).find((item) => item.accessCode === normalized)
    if (!tutor) {
      return { ok: false, error: 'Ese código de tutor no existe.' }
    }
    if (!tutor.active) {
      return { ok: false, error: 'Esta cuenta de tutor está desactivada. Pide ayuda al superadministrador.' }
    }
    setState((prev) => ({
      ...prev,
      sessionRole: 'tutor',
      activeTutorId: tutor.id,
      activeProfileId: null,
    }))
    return { ok: true }
  }, [state.tutors])

  const loginSuperadmin = useCallback((pin: string) => {
    const limit = consumeRateLimit('adminPin')
    if (!limit.allowed) {
      return { ok: false, error: limit.reason ?? 'Demasiados intentos. Espera un momento.' }
    }
    if (pin.trim() !== ADMIN_CONFIG.pin) {
      return { ok: false, error: 'PIN incorrecto. Inténtalo de nuevo.' }
    }
    setState((prev) => ({
      ...prev,
      sessionRole: 'superadmin',
      activeTutorId: null,
      activeProfileId: null,
    }))
    return { ok: true }
  }, [])

  const logoutStaff = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sessionRole: 'child',
      activeTutorId: null,
      activeProfileId: null,
    }))
  }, [])

  const addTutor = useCallback((name: string) => {
    const clean = name.trim()
    if (!clean) throw new Error('Escribe el nombre del tutor.')
    if (state.sessionRole !== 'superadmin') {
      throw new Error('Solo el superadministrador crea cuentas de tutor.')
    }
    const taken = new Set(Object.values(state.tutors).map((tutor) => tutor.accessCode))
    const tutor: TutorAccount = {
      id: `tutor-${crypto.randomUUID().slice(0, 8)}`,
      name: clean,
      accessCode: createTutorAccessCode(clean, taken),
      active: true,
      createdAt: new Date().toISOString(),
    }
    setState((prev) => ({
      ...prev,
      tutors: { ...prev.tutors, [tutor.id]: tutor },
    }))
    return tutor
  }, [state.sessionRole, state.tutors])

  const setTutorActive = useCallback((tutorId: string, active: boolean) => {
    if (state.sessionRole !== 'superadmin') return
    setState((prev) => {
      const tutor = prev.tutors[tutorId]
      if (!tutor) return prev
      return {
        ...prev,
        tutors: { ...prev.tutors, [tutorId]: { ...tutor, active } },
      }
    })
  }, [state.sessionRole])

  const regenerateTutorCode = useCallback((tutorId: string) => {
    if (state.sessionRole !== 'superadmin') return null
    const current = state.tutors[tutorId]
    if (!current) return null
    const taken = new Set(
      Object.values(state.tutors)
        .filter((tutor) => tutor.id !== tutorId)
        .map((tutor) => tutor.accessCode),
    )
    const accessCode = createTutorAccessCode(current.name, taken)
    setState((prev) => {
      const tutor = prev.tutors[tutorId]
      if (!tutor) return prev
      return {
        ...prev,
        tutors: { ...prev.tutors, [tutorId]: { ...tutor, accessCode } },
      }
    })
    return accessCode
  }, [state.sessionRole, state.tutors])

  const removeTutor = useCallback((tutorId: string) => {
    if (state.sessionRole !== 'superadmin') {
      return { ok: false, error: 'Solo el superadministrador elimina cuentas de tutor.' }
    }
    const tutor = state.tutors[tutorId]
    if (!tutor) return { ok: false, error: 'Esa cuenta ya no existe.' }
    const removedChildIds = Object.values(state.profiles)
      .filter((profile) => profile.tutorId === tutorId)
      .map((profile) => profile.id)
    setState((prev) => removeTutorAccount(prev, tutorId))
    return { ok: true, name: tutor.name, removedChildren: removedChildIds.length, removedChildIds }
  }, [state.profiles, state.sessionRole, state.tutors])

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
      tutorId?: string | null
    }) => {
      const limit = consumeRateLimit('addChild')
      if (!limit.allowed) {
        throw new Error(limit.reason ?? 'Límite de altas alcanzado')
      }
      if (!canManageProfiles(state.sessionRole)) {
        throw new Error('Solo un tutor puede crear perfiles.')
      }
      const tutorId = state.sessionRole === 'tutor' ? state.activeTutorId : (input.tutorId ?? null)
      if (!tutorId || !state.tutors[tutorId]) {
        throw new Error('Elige el tutor que se queda a cargo de este perfil.')
      }
      if (!input.birthDate) {
        throw new Error('La fecha de nacimiento es necesaria para crear el código.')
      }
      const profile = createChildProfile({ ...input, tutorId })
      if (!profile.accessCode) {
        throw new Error('Revisa el nombre y la fecha de nacimiento.')
      }
      const duplicated = Object.values(state.profiles).some((item) => item.accessCode === profile.accessCode)
      if (duplicated) {
        throw new Error('Ya existe un perfil con ese código. Cambia el nombre o la fecha.')
      }
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
    [state.activeTutorId, state.profiles, state.sessionRole, state.tutors],
  )

  const updateChildProfile = useCallback(
    (
      profileId: string,
      patch: Partial<Pick<ChildProfile, 'name' | 'birthDate' | 'grade' | 'avatarImage' | 'accent' | 'tutorId'>>,
    ) => {
      const profile = state.profiles[profileId]
      if (!profile) return { ok: false, error: 'No encontramos ese perfil.' }
      if (!ownsChild(state, profile)) {
        return { ok: false, error: 'Este perfil pertenece a otro tutor.' }
      }
      const changesIdentity = patch.name !== undefined || patch.birthDate !== undefined || patch.tutorId !== undefined
      const staff = canManageProfiles(state.sessionRole) && ownsChild(state, profile)
      if (changesIdentity && !staff) {
        return { ok: false, error: 'Solo el tutor puede cambiar el nombre, la fecha o la cuenta.' }
      }
      const nextName = patch.name?.trim() || profile.name
      const nextBirth = patch.birthDate !== undefined ? patch.birthDate : profile.birthDate
      const nextTutor = patch.tutorId !== undefined ? patch.tutorId : profile.tutorId
      if (nextTutor && !state.tutors[nextTutor] && state.sessionRole !== 'child') {
        return { ok: false, error: 'Ese tutor no existe.' }
      }
      const accessCode = childAccessCode(nextName, nextBirth)
      const duplicated = Object.values(state.profiles).some(
        (item) => item.id !== profileId && accessCode && item.accessCode === accessCode,
      )
      if (duplicated) {
        return { ok: false, error: 'Ya existe un perfil con ese código.' }
      }
      setState((prev) => ({
        ...prev,
        profiles: {
          ...prev.profiles,
          [profileId]: {
            ...profile,
            ...patch,
            name: nextName,
            birthDate: nextBirth,
            tutorId: nextTutor,
            accessCode,
            updatedAt: new Date().toISOString(),
          },
        },
      }))
      return { ok: true }
    },
    [state],
  )

  const removeChildProfile = useCallback((profileId: string) => {
    setState((prev) => {
      const profile = prev.profiles[profileId]
      if (!profile || !ownsChild(prev, profile) || !canManageProfiles(prev.sessionRole)) return prev
      const profiles = { ...prev.profiles }
      const progress = { ...prev.progress }
      delete profiles[profileId]
      delete progress[profileId]
      return {
        ...prev,
        profiles,
        progress,
        activeProfileId: prev.activeProfileId === profileId ? null : prev.activeProfileId,
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
      if (!profile || !ownsChild(prev, profile)) return prev
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
      sessionRole: state.sessionRole,
      isTutor,
      isSuperadmin,
      canManage,
      selectProfile,
      clearActiveProfile,
      loginChild,
      loginTutor,
      loginSuperadmin,
      logoutStaff,
      addTutor,
      setTutorActive,
      regenerateTutorCode,
      removeTutor,
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
      isTutor,
      isSuperadmin,
      canManage,
      selectProfile,
      clearActiveProfile,
      loginChild,
      loginTutor,
      loginSuperadmin,
      logoutStaff,
      addTutor,
      setTutorActive,
      regenerateTutorCode,
      removeTutor,
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
