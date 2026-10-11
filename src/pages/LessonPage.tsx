import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { LessonRunner } from '@/components/game/LessonRunner'
import { TopBar } from '@/components/layout/TopBar'
import { PageShell } from '@/components/ui/PageShell'
import { useApp } from '@/context/AppContext'
import { getGameBySlug } from '@/data/games/registry'
import { getReadingLesson } from '@/data/games/reading/levels'
import { getTypingLesson } from '@/data/games/typing/levels'
import { getSubjectLesson } from '@/data/subjects/catalog'
import { ReadingActivityView } from '@/games/reading/ReadingActivities'
import { TypingActivityView } from '@/games/typing/TypingActivities'
import { ageFromBirthDate } from '@/lib/age'
import { effectiveLearningAge } from '@/lib/grade'
import type {
  ActivityAttemptResult,
  LessonSessionResult,
  RewardPayload,
  AdaptiveHint,
  WordBuildActivity,
  WordQuizActivity,
  WordSelectActivity,
  WordTypeActivity,
  ReadingPracticeActivity,
} from '@/types'

function computeAccuracy(results: ActivityAttemptResult[]) {
  if (results.length === 0) return 0
  const firstTry = results.filter((item) => item.attempts === 1).length
  return firstTry / results.length
}

function computeWpm(results: ActivityAttemptResult[], durationMs: number) {
  const chars = results.reduce((sum, item) => sum + (item.correctChars ?? 0), 0)
  const minutes = Math.max(durationMs / 60000, 1 / 60)
  return chars / 5 / minutes
}

export function LessonPage() {
  const { gameSlug, lessonId } = useParams()
  const navigate = useNavigate()
  const { ready, activeProfile, completeLesson, state } = useApp()
  const [finished, setFinished] = useState<{
    result: LessonSessionResult
    reward: RewardPayload
    adaptive: AdaptiveHint
  } | null>(null)

  const game = gameSlug ? getGameBySlug(gameSlug) : undefined
  const age = effectiveLearningAge(
    ageFromBirthDate(activeProfile?.birthDate),
    activeProfile?.grade ?? null,
  )
  const grade = activeProfile?.grade ?? null
  const lesson = useMemo(() => {
    if (!lessonId || !game) return undefined
    if (game.id === 'reading') return getReadingLesson(lessonId, state.contentBank, age, grade)
    if (game.id === 'typing') return getTypingLesson(lessonId)
    return getSubjectLesson(game.id, lessonId)
  }, [age, game, grade, lessonId, state.contentBank])

  if (!ready) {
    return (
      <PageShell>
        <p className="font-display text-2xl font-bold">Cargando…</p>
      </PageShell>
    )
  }
  if (!activeProfile) return <Navigate to="/" replace />
  if (!game || !lesson) {
    return (
      <PageShell>
        <TopBar backTo="/dashboard" />
        <p className="font-display text-2xl font-bold">Lección no encontrada</p>
      </PageShell>
    )
  }

  if (finished) {
    return <Navigate to="/result" replace state={finished} />
  }

  return (
    <PageShell>
      <TopBar backTo={`/games/${game.slug}`} backLabel="Niveles" />
      <LessonRunner
        lesson={lesson}
        onExit={() => navigate(`/games/${game.slug}`)}
        renderActivity={({ activity, onResolved }) =>
          game.id === 'typing' ? (
            <TypingActivityView activity={activity} onResolved={onResolved} />
          ) : (
            <ReadingActivityView activity={activity} onResolved={onResolved} />
          )
        }
        onComplete={(results, durationMs) => {
          const words: string[] = []
          for (const activity of lesson.activities) {
            if (activity.kind === 'word_select') {
              words.push((activity as WordSelectActivity).word)
            }
            if (activity.kind === 'word_build') {
              words.push((activity as WordBuildActivity).word)
            }
            if (activity.kind === 'word_type') {
              words.push((activity as WordTypeActivity).target)
            }
            if (activity.kind === 'word_quiz') {
              words.push((activity as WordQuizActivity).answer)
            }
            if (activity.kind === 'reading_practice') {
              const practice = activity as ReadingPracticeActivity
              if (practice.mode === 'type') words.push(practice.answer)
            }
            if (activity.kind === 'token_order' && activity.separator === '') {
              words.push(activity.answer)
            }
          }

          const session: LessonSessionResult = {
            gameId: game.id,
            levelId: lesson.levelId,
            lessonId: lesson.id,
            results,
            accuracy: computeAccuracy(results),
            stars: 0,
            durationMs,
            wpm: game.id === 'typing' ? computeWpm(results, durationMs) : undefined,
            words,
            skillIds: lesson.skillIds,
          }

          session.stars =
            session.accuracy >= 0.95 ? 3 : session.accuracy >= 0.8 ? 2 : session.accuracy >= 0.6 ? 1 : 0

          const response = completeLesson(session)
          if (!response) return

          setFinished({
            result: session,
            reward: response.reward,
            adaptive: response.adaptive,
          })
        }}
      />
    </PageShell>
  )
}
