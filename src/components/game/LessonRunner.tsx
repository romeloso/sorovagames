import { useMemo, useState, type ReactNode } from 'react'
import { FeedbackBanner } from '@/components/feedback/Celebration'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useApp } from '@/context/AppContext'
import type { Activity, ActivityAttemptResult, LessonDefinition } from '@/types'

interface LessonRunnerProps {
  lesson: LessonDefinition
  renderActivity: (args: {
    activity: Activity
    onResolved: (result: Omit<ActivityAttemptResult, 'activityId' | 'attempts'>) => void
  }) => ReactNode
  onComplete: (results: ActivityAttemptResult[], durationMs: number) => void
  onExit: () => void
}

export function LessonRunner({ lesson, renderActivity, onComplete, onExit }: LessonRunnerProps) {
  const { playSound } = useApp()
  const [index, setIndex] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [results, setResults] = useState<ActivityAttemptResult[]>([])
  const [banner, setBanner] = useState<{ tone: 'success' | 'retry'; title: string } | null>(null)
  const [startedAt] = useState(() => Date.now())
  const [locked, setLocked] = useState(false)
  const activity = lesson.activities[index]

  const progress = useMemo(
    () => (lesson.activities.length === 0 ? 0 : index / lesson.activities.length),
    [index, lesson.activities.length],
  )

  if (!activity) {
    return null
  }

  const handleResolved = (partial: Omit<ActivityAttemptResult, 'activityId' | 'attempts'>) => {
    if (locked) return
    const nextAttempts = attempts + 1

    if (partial.correct) {
      setLocked(true)
      playSound('correct')
      setBanner({ tone: 'success', title: '¡Muy bien!' })
      const result: ActivityAttemptResult = {
        activityId: activity.id,
        attempts: nextAttempts,
        ...partial,
      }
      const nextResults = [...results, result]
      setResults(nextResults)

      window.setTimeout(() => {
        setBanner(null)
        setAttempts(0)
        setLocked(false)
        if (index + 1 >= lesson.activities.length) {
          onComplete(nextResults, Date.now() - startedAt)
        } else {
          setIndex((value) => value + 1)
        }
      }, 700)
    } else {
      setAttempts(nextAttempts)
      playSound('wrong')
      setBanner({ tone: 'retry', title: '¡Casi! Inténtalo otra vez' })
      window.setTimeout(() => setBanner(null), 900)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">Lección</p>
          <h2 className="font-display text-3xl font-bold text-ink">{lesson.title}</h2>
          {lesson.objective ? (
            <p className="mt-1 max-w-xl text-sm font-semibold text-ink-soft">{lesson.objective}</p>
          ) : null}
        </div>
        <Button variant="secondary" size="md" onClick={onExit}>
          Salir
        </Button>
      </div>

      <ProgressBar value={progress} label={`Actividad ${index + 1} de ${lesson.activities.length}`} />

      {banner ? <FeedbackBanner tone={banner.tone} title={banner.title} /> : null}

      <div className="rounded-[2rem] bg-white/85 p-5 shadow-[0_12px_30px_rgba(31,42,55,0.08)] ring-1 ring-ink/5 sm:p-8">
        {renderActivity({ activity, onResolved: handleResolved })}
      </div>
    </div>
  )
}
