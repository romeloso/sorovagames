import { describe, expect, it } from 'vitest'
import { answersMatch } from '@/domain/reading/answers'
import { LEO_LESSONS, READING_SKILLS, countLeoActivities } from './curriculum'
import { READING_WORLDS } from './levels'

describe('currículo Leo y Escribo', () => {
  it('publica al menos 100 actividades distintas en los seis mundos', () => {
    expect(READING_WORLDS).toHaveLength(6)
    expect(countLeoActivities()).toBeGreaterThanOrEqual(100)
    const ids = LEO_LESSONS.flatMap((lesson) => lesson.activities.map((activity) => activity.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('cada lección declara objetivo, habilidad y respuesta', () => {
    for (const lesson of LEO_LESSONS) {
      expect(lesson.objective).toBeTruthy()
      expect(lesson.skillIds?.length).toBeGreaterThan(0)
      expect(lesson.activities.length).toBeGreaterThan(0)
      for (const activity of lesson.activities) {
        expect(activity.prompt.length).toBeGreaterThan(3)
        if ('options' in activity && activity.options) {
          const values = activity.options.map((option) => option.value)
          expect(new Set(values).size).toBe(values.length)
          if ('answer' in activity) {
            expect(values).toContain(activity.answer)
          }
        }
      }
    }
  })

  it('las habilidades de cada lección pertenecen a su mundo o a uno anterior', () => {
    const worldOrder = READING_WORLDS.map((world) => world.id)
    for (const lesson of LEO_LESSONS) {
      for (const skillId of lesson.skillIds ?? []) {
        const skill = READING_SKILLS.find((item) => item.id === skillId)
        expect(skill).toBeTruthy()
        const skillWorld = worldOrder.indexOf(skill!.worldId)
        const lessonWorld = worldOrder.indexOf(lesson.levelId)
        expect(skillWorld).toBeGreaterThanOrEqual(0)
        expect(skillWorld).toBeLessThanOrEqual(lessonWorld)
      }
    }
  })

  it('respeta tildes al comparar respuestas', () => {
    expect(answersMatch('mamá', 'MAMÁ')).toBe(true)
    expect(answersMatch('mama', 'MAMÁ')).toBe(false)
    expect(answersMatch('  el   sol ', 'EL SOL')).toBe(true)
  })
})
