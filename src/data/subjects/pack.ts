import type { Activity, GameId, GameLevelMeta, LessonDefinition } from '@/types'

export interface ChoiceItem {
  prompt: string
  answer: string
  options: string[]
  speak?: string
  hint?: string
  image?: string
}

export interface OrderItem {
  kind: 'order'
  prompt: string
  tokens: string[]
  answer: string
  separator?: '' | ' '
  speak?: string
  hint?: string
}

export type SubjectItem = ChoiceItem | OrderItem

export interface SubjectLessonSpec {
  title: string
  objective: string
  skill: string
  instructions: string
  items: SubjectItem[]
}

export interface SubjectWorldSpec {
  id: string
  title: string
  subtitle: string
  icon: string
  lessons: SubjectLessonSpec[]
}

export interface PackedSubject {
  levels: GameLevelMeta[]
  lessons: LessonDefinition[]
  skillTitles: Record<string, string>
}

function isOrder(item: SubjectItem): item is OrderItem {
  return 'kind' in item && item.kind === 'order'
}

function toActivity(id: string, item: SubjectItem): Activity {
  if (isOrder(item)) {
    return {
      id,
      kind: 'token_order',
      prompt: item.prompt,
      tokens: item.tokens,
      answer: item.answer,
      separator: item.separator ?? ' ',
      speak: item.speak,
      hint: item.hint,
    }
  }
  return {
    id,
    kind: 'word_quiz',
    prompt: item.prompt,
    clue: item.prompt,
    image: item.image,
    speak: item.speak ?? item.prompt,
    hint: item.hint,
    options: item.options.map((value) => ({ id: value, label: value, value })),
    answer: item.answer,
  }
}

export function packSubject(gameId: GameId, worlds: SubjectWorldSpec[], skillTitles: Record<string, string>): PackedSubject {
  const lessons: LessonDefinition[] = []
  const levels: GameLevelMeta[] = worlds.map((world, worldIndex) => {
    const lessonIds = world.lessons.map((lesson, lessonIndex) => {
      const id = `${world.id}-l${lessonIndex + 1}`
      lessons.push({
        id,
        gameId,
        levelId: world.id,
        title: lesson.title,
        objective: lesson.objective,
        skillIds: [lesson.skill],
        instructions: lesson.instructions,
        estimatedMinutes: 6,
        source: 'builtin',
        activities: lesson.items.map((item, itemIndex) => toActivity(`${id}-a${itemIndex + 1}`, item)),
      })
      return id
    })
    return {
      id: world.id,
      gameId,
      order: worldIndex + 1,
      title: world.title,
      subtitle: world.subtitle,
      icon: world.icon,
      lessonIds,
    }
  })
  return { levels, lessons, skillTitles }
}

export function choice(prompt: string, answer: string, options: string[], extra?: Partial<ChoiceItem>): ChoiceItem {
  return { prompt, answer, options, ...extra }
}

export function order(prompt: string, tokens: string[], answer: string, extra?: Partial<OrderItem>): OrderItem {
  return { kind: 'order', prompt, tokens, answer, separator: ' ', ...extra }
}
