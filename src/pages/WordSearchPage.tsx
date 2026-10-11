import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { PageShell } from '@/components/ui/PageShell'
import { useApp } from '@/context/AppContext'
import { getWordSearchPuzzle } from '@/data/games/wordsearch/puzzles'
import { WordSearchBoard } from '@/games/wordsearch/WordSearchBoard'
import type { AdaptiveHint, LessonSessionResult, RewardPayload } from '@/types'

export function WordSearchPage() {
  const { puzzleId } = useParams()
  const { ready, activeProfile, completeLesson, playSound } = useApp()
  const [finished, setFinished] = useState<{
    result: LessonSessionResult
    reward: RewardPayload
    adaptive: AdaptiveHint
  } | null>(null)

  const puzzle = useMemo(
    () => (puzzleId ? getWordSearchPuzzle(puzzleId) : undefined),
    [puzzleId],
  )

  if (!ready) {
    return (
      <PageShell>
        <p className="font-display text-2xl font-bold">Cargando…</p>
      </PageShell>
    )
  }
  if (!activeProfile) return <Navigate to="/" replace />
  if (!puzzle) {
    return (
      <PageShell>
        <TopBar backTo="/games/sopa-de-letras" backLabel="Niveles" />
        <p className="font-display text-2xl font-bold">Sopa no encontrada</p>
      </PageShell>
    )
  }

  if (finished) {
    return <Navigate to="/result" replace state={finished} />
  }

  return (
    <PageShell>
      <TopBar backTo="/games/sopa-de-letras" backLabel="Niveles" />
      <WordSearchBoard
        puzzle={puzzle}
        onPlaySound={playSound}
        onComplete={(foundCount, total, durationMs) => {
          const accuracy = total === 0 ? 0 : foundCount / total
          const session: LessonSessionResult = {
            gameId: 'wordsearch',
            levelId: puzzle.id,
            lessonId: puzzle.id,
            results: puzzle.words.map((word) => ({
              activityId: `${puzzle.id}-${word}`,
              correct: foundCount > 0,
              attempts: 1,
              timeMs: Math.round(durationMs / Math.max(total, 1)),
            })),
            accuracy,
            stars: accuracy >= 0.95 ? 3 : accuracy >= 0.8 ? 2 : accuracy >= 0.6 ? 1 : 0,
            durationMs,
            words: puzzle.words,
          }
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
