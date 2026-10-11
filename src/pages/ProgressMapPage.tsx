import { Navigate, useNavigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { PageShell } from '@/components/ui/PageShell'
import { useApp } from '@/context/AppContext'
import { getAvailableReadingLevels } from '@/data/games/reading/levels'
import { TYPING_LEVELS } from '@/data/games/typing/levels'
import { getWordSearchLevels } from '@/data/games/wordsearch/levels'
import { getGameById } from '@/data/games/registry'
import { getSubjectLevels, SUBJECT_GAME_IDS } from '@/data/subjects/catalog'
import { getLevelProgress } from '@/domain/progress'
import { ageFromBirthDate } from '@/lib/age'
import { effectiveLearningAge } from '@/lib/grade'
import { cn } from '@/lib/cn'

function AdventurePath({
  title,
  levels,
  progress,
  onOpen,
}: {
  title: string
  levels: ReturnType<typeof getAvailableReadingLevels>
  progress: ReturnType<ReturnType<typeof useApp>['getGameProgress']>
  onOpen: (levelId: string) => void
}) {
  if (!progress) return null

  return (
    <section className="rounded-[2rem] bg-white/80 p-5 sm:p-7">
      <h2 className="mb-5 font-display text-3xl font-bold">{title}</h2>
      <ol className="space-y-0">
        {levels.map((level, index) => {
          const levelProgress = getLevelProgress(progress, level)
          const upcoming = level.lessonIds.length === 0
          const locked = !levelProgress.unlocked || upcoming

          return (
            <li key={level.id} className="relative pb-6 last:pb-0">
              {index < levels.length - 1 ? (
                <div className="absolute left-6 top-14 h-[calc(100%-2rem)] w-1 bg-sand" />
              ) : null}
              <button
                type="button"
                disabled={locked}
                onClick={() => onOpen(level.id)}
                className={cn(
                  'relative flex w-full items-center gap-4 rounded-3xl p-4 text-left transition',
                  locked ? 'bg-cream/70 opacity-80' : 'bg-mint/40 hover:-translate-y-0.5',
                )}
              >
                <span
                  className={cn(
                    'grid h-12 w-12 shrink-0 place-items-center rounded-full text-xl font-bold',
                    locked ? 'bg-ink/10' : 'bg-teal text-white',
                  )}
                >
                  {locked ? '🔒' : '🟢'}
                </span>
                <div className="flex-1">
                  <p className="font-display text-xl font-bold">
                    {level.icon} {level.title}
                  </p>
                  <p className="text-sm font-semibold text-ink-soft">{level.subtitle}</p>
                  {!upcoming ? (
                    <p className="mt-1 text-sm font-bold text-teal">
                      {'⭐'.repeat(Math.min(3, Math.max(0, Math.round(levelProgress.stars / Math.max(1, level.lessonIds.length))))) ||
                        'Sin estrellas aún'}
                    </p>
                  ) : null}
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export function ProgressMapPage() {
  const navigate = useNavigate()
  const { ready, activeProfile, getGameProgress, state } = useApp()

  if (!ready) {
    return (
      <PageShell>
        <p className="font-display text-2xl font-bold">Cargando…</p>
      </PageShell>
    )
  }
  if (!activeProfile) return <Navigate to="/" replace />

  const age = effectiveLearningAge(ageFromBirthDate(activeProfile.birthDate), activeProfile.grade)
  const grade = activeProfile.grade

  return (
    <PageShell wide>
      <TopBar backTo="/dashboard" backLabel="Dashboard" showBackToProfiles />
      <h1 className="mb-6 font-display text-4xl font-bold">🌟 Mi aventura</h1>
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <AdventurePath
          title="🔤 Sopa de letras"
          levels={getWordSearchLevels(age, grade)}
          progress={getGameProgress('wordsearch')}
          onOpen={() => navigate('/games/sopa-de-letras')}
        />
        <AdventurePath
          title="📚 Leo y Escribo"
          levels={getAvailableReadingLevels(state.contentBank, age, grade)}
          progress={getGameProgress('reading')}
          onOpen={() => navigate('/games/aprende-a-leer')}
        />
        <AdventurePath
          title="⌨️ Aventura de teclado"
          levels={TYPING_LEVELS.filter((level) => level.lessonIds.length > 0)}
          progress={getGameProgress('typing')}
          onOpen={() => navigate('/games/teclea-como-una-experta')}
        />
        {SUBJECT_GAME_IDS.map((subjectId) => {
          const game = getGameById(subjectId)
          if (!game) return null
          return (
            <AdventurePath
              key={subjectId}
              title={`${game.icon} ${game.title}`}
              levels={getSubjectLevels(subjectId)}
              progress={getGameProgress(subjectId)}
              onOpen={() => navigate(`/games/${game.slug}`)}
            />
          )
        })}
      </div>
    </PageShell>
  )
}
