import { contentFitsLearner } from '@/lib/grade'
import type { SchoolGrade } from '@/types'
import { invalidateContentCaches } from '@/services/cache/contentCache'
import type {
  AdminPassageItem,
  AdminWordItem,
  AvatarLibraryItem,
  ChoiceOption,
  ContentBank,
  GameId,
  LessonDefinition,
  ReadingPracticeActivity,
  StudyTopic,
  WordQuizActivity,
} from '@/types'

export interface LearnerContext {
  age: number | null
  grade: SchoolGrade | null
}

const choice = (value: string): ChoiceOption => ({
  id: value,
  label: value,
  value,
})

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function normalizeBank(bank: ContentBank): ContentBank {
  return {
    words: bank.words ?? [],
    passages: bank.passages ?? [],
    topics: bank.topics ?? [],
    avatarLibrary: bank.avatarLibrary ?? [],
  }
}

/** Convierte material del admin en lecciones jugables de lectura, filtradas por edad/grado. */
export function buildAdminReadingLessons(
  bank: ContentBank,
  age: number | null = null,
  grade: SchoolGrade | null = null,
): LessonDefinition[] {
  const normalized = normalizeBank(bank)
  const learner = { age, grade }
  const words = normalized.words.filter((item) => contentFitsLearner(item, learner))
  const passages = normalized.passages.filter((item) => contentFitsLearner(item, learner))
  const lessons: LessonDefinition[] = []

  if (words.length > 0) {
    const quizActivities: WordQuizActivity[] = words.slice(0, 12).map((word, index) => {
      const options = shuffle([
        choice(word.word.toUpperCase()),
        ...word.distractors.slice(0, 2).map((item) => choice(item.toUpperCase())),
      ])
      while (options.length < 3) {
        options.push(choice(`OPCIÓN ${options.length + 1}`))
      }
      return {
        id: `admin-quiz-${word.id}-${index}`,
        kind: 'word_quiz',
        prompt: '¿Cuál es la palabra correcta?',
        image: word.image,
        clue: word.clue ?? `Elige la palabra: ${word.word}`,
        options,
        answer: word.word.toUpperCase(),
      }
    })

    const practiceActivities: ReadingPracticeActivity[] = words.slice(0, 8).map((word, index) => ({
      id: `admin-practice-${word.id}-${index}`,
      kind: 'reading_practice',
      prompt: 'Lee y escribe la palabra',
      text: word.word.toUpperCase(),
      mode: 'type',
      answer: word.word.toUpperCase(),
      hint: word.clue,
    }))

    if (quizActivities.length > 0) {
      lessons.push({
        id: 'reading-admin-quiz',
        gameId: 'reading',
        levelId: 'reading-palabras',
        title: 'Quiz del admin',
        source: 'admin',
        activities: quizActivities,
      })
    }

    if (practiceActivities.length > 0) {
      lessons.push({
        id: 'reading-admin-practice',
        gameId: 'reading',
        levelId: 'reading-escritura',
        title: 'Práctica del admin',
        source: 'admin',
        activities: practiceActivities,
      })
    }
  }

  if (passages.length > 0) {
    const passageActivities = passages.flatMap((passage) => {
      const read: ReadingPracticeActivity = {
        id: `admin-pass-read-${passage.id}`,
        kind: 'reading_practice',
        prompt: 'Lee el texto con calma',
        text: passage.text,
        mode: 'choose',
        options: [choice('Ya lo leí')],
        answer: 'Ya lo leí',
        hint: passage.title,
      }
      const quiz: WordQuizActivity = {
        id: `admin-pass-quiz-${passage.id}`,
        kind: 'word_quiz',
        prompt: passage.question,
        clue: passage.text,
        options: shuffle(passage.options.map((item) => choice(item))),
        answer: passage.answer,
      }
      return [read, quiz]
    })

    lessons.push({
      id: 'reading-admin-passages',
      gameId: 'reading',
      levelId: 'reading-historias',
      title: 'Historias del admin',
      source: 'admin',
      activities: passageActivities,
    })
  }

  return lessons
}

export function createAdminWord(input: {
  word: string
  image?: string
  clue?: string
  distractors: string[]
  minAge?: number
  maxAge?: number
  minGrade?: number
  maxGrade?: number
}): AdminWordItem {
  invalidateContentCaches()
  return {
    id: `word-${crypto.randomUUID()}`,
    word: input.word.trim(),
    image: input.image?.trim() || undefined,
    clue: input.clue?.trim() || undefined,
    distractors: input.distractors.map((item) => item.trim()).filter(Boolean),
    minAge: input.minAge ?? 3,
    maxAge: input.maxAge ?? 12,
    minGrade: input.minGrade ?? 0,
    maxGrade: input.maxGrade ?? 6,
    createdAt: new Date().toISOString(),
  }
}

export function createAdminPassage(input: {
  title: string
  text: string
  question: string
  options: string[]
  answer: string
  minAge?: number
  maxAge?: number
  minGrade?: number
  maxGrade?: number
}): AdminPassageItem {
  invalidateContentCaches()
  return {
    id: `pass-${crypto.randomUUID()}`,
    title: input.title.trim(),
    text: input.text.trim(),
    question: input.question.trim(),
    options: input.options.map((item) => item.trim()).filter(Boolean),
    answer: input.answer.trim(),
    minAge: input.minAge ?? 3,
    maxAge: input.maxAge ?? 12,
    minGrade: input.minGrade ?? 0,
    maxGrade: input.maxGrade ?? 6,
    createdAt: new Date().toISOString(),
  }
}

export function createStudyTopic(input: {
  subjectId: GameId
  title: string
  description: string
  minAge?: number
  maxAge?: number
  minGrade?: number
  maxGrade?: number
  reinforce?: boolean
}): StudyTopic {
  invalidateContentCaches()
  return {
    id: `topic-${crypto.randomUUID()}`,
    subjectId: input.subjectId,
    title: input.title.trim(),
    description: input.description.trim(),
    minAge: input.minAge ?? 3,
    maxAge: input.maxAge ?? 12,
    minGrade: input.minGrade ?? 0,
    maxGrade: input.maxGrade ?? 6,
    reinforce: Boolean(input.reinforce),
    createdAt: new Date().toISOString(),
  }
}

export function createAvatarLibraryItem(input: {
  label: string
  src: string
}): AvatarLibraryItem {
  invalidateContentCaches()
  return {
    id: `avatar-${crypto.randomUUID()}`,
    label: input.label.trim() || 'Foto',
    src: input.src,
    createdAt: new Date().toISOString(),
  }
}

export function topicsForAge(topics: StudyTopic[], age: number | null, subjectId?: GameId) {
  return topicsForLearner(topics, { age, grade: null }, subjectId)
}

export function topicsForLearner(
  topics: StudyTopic[],
  learner: LearnerContext,
  subjectId?: GameId,
) {
  return topics.filter(
    (topic) =>
      contentFitsLearner(topic, learner) && (subjectId ? topic.subjectId === subjectId : true),
  )
}
