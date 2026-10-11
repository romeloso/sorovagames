import { APP_CONFIG } from '@/config/app'
import { isIndependentSuccess, recordSkillPractice } from '@/domain/reading/mastery'
import type {
  GameId,
  GameLevelMeta,
  GameProgress,
  LessonDefinition,
  LessonProgress,
  LessonSessionResult,
  LevelProgress,
  ReadingStats,
  SubjectStats,
  TypingStats,
} from '@/types'
import { starsFromAccuracy } from '@/domain/rewards'

export function createEmptyReadingStats(): ReadingStats {
  return {
    wordsLearned: [],
    lessonsCompleted: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    skills: {},
  }
}

export function createEmptySubjectStats(): SubjectStats {
  return {
    lessonsCompleted: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    skills: {},
  }
}

const MASTERY_GAMES = new Set<GameId>(['reading', 'math', 'science', 'english', 'technology'])

export function usesMasteryGate(gameId: GameId) {
  return MASTERY_GAMES.has(gameId)
}

export function createEmptyTypingStats(): TypingStats {
  return {
    bestWpm: 0,
    bestAccuracy: 0,
    keysPracticed: [],
    lessonsCompleted: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
  }
}

export function createInitialGameProgress(
  gameId: GameId,
  levels: GameLevelMeta[],
): GameProgress {
  const firstLevel = levels[0]
  const lessonProgress: Record<string, LessonProgress> = {}

  for (const level of levels) {
    level.lessonIds.forEach((lessonId, index) => {
      lessonProgress[lessonId] = {
        lessonId,
        stars: 0,
        bestAccuracy: 0,
        completions: 0,
        lastPlayedAt: null,
        unlocked: level.id === firstLevel?.id && index === 0,
      }
    })
  }

  return {
    gameId,
    unlockedLevelIds: firstLevel ? [firstLevel.id] : [],
    lessonProgress,
    stats:
      gameId === 'reading'
        ? createEmptyReadingStats()
        : usesMasteryGate(gameId)
          ? createEmptySubjectStats()
          : gameId === 'typing'
            ? createEmptyTypingStats()
            : gameId === 'wordsearch'
              ? { puzzlesCompleted: 0, wordsFound: 0 }
              : {},
  }
}

/** Asegura que lecciones nuevas (builtin o admin) existan en el progreso. */
export function syncGameProgressWithLevels(
  progress: GameProgress,
  levels: GameLevelMeta[],
): GameProgress {
  const lessonProgress = { ...progress.lessonProgress }
  const unlockedLevelIds = new Set(progress.unlockedLevelIds)
  const firstLevel = levels[0]

  for (const level of levels) {
    level.lessonIds.forEach((lessonId, index) => {
      if (!lessonProgress[lessonId]) {
        lessonProgress[lessonId] = {
          lessonId,
          stars: 0,
          bestAccuracy: 0,
          completions: 0,
          lastPlayedAt: null,
          unlocked:
            unlockedLevelIds.has(level.id) ||
            (level.id === firstLevel?.id && index === 0),
        }
      }
    })
  }

  if (unlockedLevelIds.size === 0 && firstLevel) {
    unlockedLevelIds.add(firstLevel.id)
    const firstLessonId = firstLevel.lessonIds[0]
    if (firstLessonId && lessonProgress[firstLessonId]) {
      lessonProgress[firstLessonId] = {
        ...lessonProgress[firstLessonId],
        unlocked: true,
      }
    }
  }

  return {
    ...progress,
    unlockedLevelIds: [...unlockedLevelIds],
    lessonProgress,
  }
}

export function getLevelProgress(
  progress: GameProgress,
  level: GameLevelMeta,
): LevelProgress {
  const lessons = level.lessonIds.map((id) => progress.lessonProgress[id]).filter(Boolean)
  const completedLessons = lessons.filter((lesson) => (lesson?.completions ?? 0) > 0).length
  const stars = lessons.reduce((sum, lesson) => sum + (lesson?.stars ?? 0), 0)

  return {
    levelId: level.id,
    unlocked: progress.unlockedLevelIds.includes(level.id),
    stars,
    completedLessons,
    totalLessons: level.lessonIds.length,
  }
}

export function applyLessonResult(
  progress: GameProgress,
  levels: GameLevelMeta[],
  lessons: LessonDefinition[],
  result: LessonSessionResult,
): GameProgress {
  const lesson = progress.lessonProgress[result.lessonId]
  if (!lesson) return progress

  const stars = Math.max(lesson.stars, starsFromAccuracy(result.accuracy))
  const nextLessonProgress: LessonProgress = {
    ...lesson,
    stars,
    bestAccuracy: Math.max(lesson.bestAccuracy, result.accuracy),
    completions: lesson.completions + 1,
    lastPlayedAt: new Date().toISOString(),
    unlocked: true,
  }

  const lessonProgress = {
    ...progress.lessonProgress,
    [result.lessonId]: nextLessonProgress,
  }

  const unlockedLevelIds = new Set(progress.unlockedLevelIds)
  const currentLevelIndex = levels.findIndex((level) => level.id === result.levelId)
  const currentLevel = levels[currentLevelIndex]

  if (currentLevel) {
    const levelLessons = currentLevel.lessonIds
      .map((id) => lessonProgress[id])
      .filter(Boolean)
    const played = levelLessons.filter((item) => (item?.completions ?? 0) > 0)
    const readingGate = usesMasteryGate(result.gameId)
    const avgAccuracy = readingGate
      ? played.reduce((sum, item) => sum + (item?.bestAccuracy ?? 0), 0) / Math.max(1, played.length)
      : levelLessons.reduce((sum, item) => sum + (item?.bestAccuracy ?? 0), 0) /
        Math.max(1, levelLessons.length)
    const threshold = readingGate ? 0.85 : APP_CONFIG.unlockThreshold
    const neededRatio = readingGate ? 0.8 : 0.5
    const completedEnough = played.length >= Math.ceil(levelLessons.length * neededRatio)

    if (played.length > 0 && avgAccuracy >= threshold && completedEnough) {
      const nextLevel = levels[currentLevelIndex + 1]
      if (nextLevel) {
        unlockedLevelIds.add(nextLevel.id)
        for (const lessonId of nextLevel.lessonIds) {
          const existing = lessonProgress[lessonId]
          if (existing) {
            lessonProgress[lessonId] = { ...existing, unlocked: true }
          }
        }
      }
    }

    // Unlock next lesson within level
    const lessonIndex = currentLevel.lessonIds.indexOf(result.lessonId)
    const nextLessonId = currentLevel.lessonIds[lessonIndex + 1]
    if (nextLessonId && lessonProgress[nextLessonId]) {
      lessonProgress[nextLessonId] = {
        ...lessonProgress[nextLessonId],
        unlocked: true,
      }
    }
  }

  let stats = progress.stats
  if (result.gameId === 'reading') {
    const reading = { ...(stats as ReadingStats) }
    reading.lessonsCompleted += 1
    reading.correctAnswers += result.results.filter((item) => item.correct).length
    reading.totalAnswers += result.results.length
    const learned = new Set(reading.wordsLearned)
    for (const word of result.words ?? []) {
      learned.add(word.toUpperCase())
    }
    reading.wordsLearned = [...learned]
    if (result.skillIds && result.skillIds.length > 0) {
      const independentCorrect = result.results.filter(isIndependentSuccess).length
      reading.skills = recordSkillPractice(reading.skills ?? {}, result.skillIds, {
        independentCorrect,
        independentTotal: result.results.length,
        assistedCorrect: result.results.filter((item) => item.correct && !isIndependentSuccess(item)).length,
        at: new Date().toISOString(),
      })
    }
    stats = reading
  } else if (usesMasteryGate(result.gameId)) {
    const subject = { ...createEmptySubjectStats(), ...(stats as Partial<SubjectStats>) }
    subject.lessonsCompleted += 1
    subject.correctAnswers += result.results.filter((item) => item.correct).length
    subject.totalAnswers += result.results.length
    if (result.skillIds && result.skillIds.length > 0) {
      const independentCorrect = result.results.filter(isIndependentSuccess).length
      subject.skills = recordSkillPractice(subject.skills ?? {}, result.skillIds, {
        independentCorrect,
        independentTotal: result.results.length,
        assistedCorrect: result.results.filter((item) => item.correct && !isIndependentSuccess(item)).length,
        at: new Date().toISOString(),
      })
    }
    stats = subject
  }

  if (result.gameId === 'typing') {
    const typing = { ...(stats as TypingStats) }
    typing.lessonsCompleted += 1
    typing.bestAccuracy = Math.max(typing.bestAccuracy, result.accuracy)
    typing.bestWpm = Math.max(typing.bestWpm, result.wpm ?? 0)
    for (const attempt of result.results) {
      typing.totalKeystrokes += attempt.typedChars ?? 0
      typing.correctKeystrokes += attempt.correctChars ?? 0
    }
    stats = typing
  }

  if (result.gameId === 'wordsearch') {
    const current = stats as { puzzlesCompleted?: number; wordsFound?: number }
    stats = {
      puzzlesCompleted: (current.puzzlesCompleted ?? 0) + 1,
      wordsFound: (current.wordsFound ?? 0) + (result.words?.length ?? 0),
    }
  }

  void lessons

  return {
    ...progress,
    unlockedLevelIds: [...unlockedLevelIds],
    lessonProgress,
    stats,
  }
}

export function overallGameCompletion(progress: GameProgress): number {
  const lessons = Object.values(progress.lessonProgress)
  if (lessons.length === 0) return 0
  const completed = lessons.filter((lesson) => lesson.completions > 0).length
  return completed / lessons.length
}
