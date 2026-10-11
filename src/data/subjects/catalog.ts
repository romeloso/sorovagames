import { ENGLISH_PACK } from '@/data/games/english/curriculum'
import { MATH_PACK } from '@/data/games/math/curriculum'
import { SCIENCE_PACK } from '@/data/games/science/curriculum'
import { TECHNOLOGY_PACK } from '@/data/games/technology/curriculum'
import type { GameId, GameLevelMeta, LessonDefinition } from '@/types'
import type { PackedSubject } from '@/data/subjects/pack'

const PACKS: Record<'math' | 'science' | 'english' | 'technology', PackedSubject> = {
  math: MATH_PACK,
  science: SCIENCE_PACK,
  english: ENGLISH_PACK,
  technology: TECHNOLOGY_PACK,
}

export type SubjectGameId = keyof typeof PACKS

export const SUBJECT_GAME_IDS: SubjectGameId[] = ['math', 'science', 'english', 'technology']

export function isSubjectGame(gameId: GameId): gameId is SubjectGameId {
  return Object.prototype.hasOwnProperty.call(PACKS, gameId)
}

export function getSubjectPack(gameId: SubjectGameId): PackedSubject {
  return PACKS[gameId]
}

export function getSubjectLevels(gameId: GameId): GameLevelMeta[] {
  if (!isSubjectGame(gameId)) return []
  return PACKS[gameId].levels
}

export function getSubjectLessons(gameId: GameId): LessonDefinition[] {
  if (!isSubjectGame(gameId)) return []
  return PACKS[gameId].lessons
}

export function getSubjectLesson(gameId: GameId, lessonId: string): LessonDefinition | undefined {
  return getSubjectLessons(gameId).find((lesson) => lesson.id === lessonId)
}

export function countSubjectActivities(gameId: GameId): number {
  return getSubjectLessons(gameId).reduce((sum, lesson) => sum + lesson.activities.length, 0)
}

export function subjectSkillTitles(gameId: GameId): Record<string, string> {
  if (!isSubjectGame(gameId)) return {}
  return PACKS[gameId].skillTitles
}
