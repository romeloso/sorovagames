import type { ContentBank, GameId, LessonDefinition, SchoolGrade, StudyTopic } from '@/types'
import {
  buildAdminReadingLessons,
  topicsForLearner,
  type LearnerContext,
} from '@/services/contentService'
import { contentBankFingerprint, MemoryCache } from './memoryCache'

const lessonCache = new MemoryCache<LessonDefinition[]>({ maxEntries: 32, ttlMs: 120_000 })
const topicCache = new MemoryCache<StudyTopic[]>({ maxEntries: 48, ttlMs: 120_000 })

export function getCachedAdminReadingLessons(
  bank: ContentBank,
  age: number | null,
  grade: SchoolGrade | null = null,
): LessonDefinition[] {
  const key = `lessons:${contentBankFingerprint(bank)}:${age ?? 'any'}:g${grade ?? 'any'}`
  const hit = lessonCache.get(key)
  if (hit) return hit
  const lessons = buildAdminReadingLessons(bank, age, grade)
  lessonCache.set(key, lessons)
  return lessons
}

export function getCachedTopicsForLearner(
  topics: StudyTopic[],
  learner: LearnerContext,
  subjectId?: GameId,
): StudyTopic[] {
  const key = `topics:${topics.length}:${topics[0]?.id ?? ''}:${learner.age ?? 'any'}:g${learner.grade ?? 'any'}:${subjectId ?? 'all'}`
  const hit = topicCache.get(key)
  if (hit) return hit
  const filtered = topicsForLearner(topics, learner, subjectId)
  topicCache.set(key, filtered)
  return filtered
}

export function invalidateContentCaches() {
  lessonCache.invalidate()
  topicCache.invalidate()
}
