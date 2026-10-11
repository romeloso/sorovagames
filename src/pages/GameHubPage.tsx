import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { useApp } from '@/context/AppContext'
import { getGameBySlug } from '@/data/games/registry'
import { getAvailableReadingLevels, getReadingLesson } from '@/data/games/reading/levels'
import { TYPING_LEVELS, getTypingLesson } from '@/data/games/typing/levels'
import { getWordSearchLevels, getWordSearchLesson } from '@/data/games/wordsearch/levels'
import { getSubjectLesson, getSubjectLevels, isSubjectGame } from '@/data/subjects/catalog'
import { getLevelProgress } from '@/domain/progress'
import { ageFromBirthDate, formatAge } from '@/lib/age'
import { effectiveLearningAge, formatGrade } from '@/lib/grade'
import { cn } from '@/lib/cn'
import { getCachedTopicsForLearner } from '@/services/cache/contentCache'
import type { GameLevelMeta } from '@/types'

export function GameHubPage() {
  const { gameSlug } = useParams()
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

  const game = gameSlug ? getGameBySlug(gameSlug) : undefined
  if (!game) {
    return (
      <PageShell>
        <TopBar backTo="/dashboard" />
        <p className="font-display text-2xl font-bold">Juego no encontrado</p>
      </PageShell>
    )
  }

  const age = effectiveLearningAge(ageFromBirthDate(activeProfile.birthDate), activeProfile.grade)
  const grade = activeProfile.grade
  const subjectTopics = getCachedTopicsForLearner(
    state.contentBank.topics,
    { age, grade },
    game.id,
  )

  if (game.status !== 'available') {
    return (
      <PageShell>
        <TopBar backTo="/dashboard" />
        <div className="rounded-[2rem] bg-white/80 p-8 text-center">
          <p className="text-6xl">{game.icon}</p>
          <h1 className="mt-4 font-display text-4xl font-bold">{game.title}</h1>
          <p className="mt-3 text-lg font-semibold text-ink-soft">
            Este juego llegará pronto. ¡Mientras tanto practica lectura, tecleo o sopa de letras!
          </p>
          {subjectTopics.length > 0 ? (
            <div className="mx-auto mt-6 max-w-lg rounded-2xl bg-sand/70 p-4 text-left">
              <p className="font-bold text-ink">Temas para reforzar ({formatAge(age)})</p>
              <ul className="mt-2 space-y-2">
                {subjectTopics.map((topic) => (
                  <li key={topic.id} className="text-sm font-semibold text-ink-soft">
                    {topic.title}: {topic.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Button className="mt-6" onClick={() => navigate('/dashboard')}>
            Volver al dashboard
          </Button>
        </div>
      </PageShell>
    )
  }

  const levels: GameLevelMeta[] =
    game.id === 'reading'
      ? getAvailableReadingLevels(state.contentBank, age, grade)
      : game.id === 'typing'
        ? TYPING_LEVELS.filter((level) => level.lessonIds.length > 0)
        : game.id === 'wordsearch'
          ? getWordSearchLevels(age, grade)
          : getSubjectLevels(game.id)
  const worldWord = isSubjectGame(game.id) ? 'Mundo' : 'Nivel'
  const progress = getGameProgress(game.id)

  return (
    <PageShell>
      <TopBar backTo="/dashboard" backLabel="Dashboard" />
      <section className="mb-6 rounded-[2rem] p-6 text-white" style={{ backgroundColor: game.accent }}>
        <p className="text-5xl" aria-hidden="true">
          {game.icon}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">{game.title}</h1>
        <p className="mt-2 text-lg font-semibold text-white/90">{game.description}</p>
        <p className="mt-2 text-sm font-bold text-white/80">
          Adaptado a {formatGrade(grade)}
          {age != null ? ` · ${formatAge(age)}` : ''}
        </p>
      </section>

      {subjectTopics.length > 0 ? (
        <section className="mb-5 rounded-[1.75rem] bg-white/85 p-5 ring-1 ring-ink/5">
          <h2 className="font-display text-xl font-bold">Temas de esta materia</h2>
          <ul className="mt-3 space-y-2">
            {subjectTopics.map((topic) => (
              <li key={topic.id} className="rounded-xl bg-sand/60 px-3 py-2">
                <p className="font-bold">
                  {topic.title}
                  {topic.reinforce ? ' · Refuerzo' : ''}
                </p>
                <p className="text-sm font-semibold text-ink-soft">{topic.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="space-y-4">
        {levels.map((level) => {
          const levelProgress = progress ? getLevelProgress(progress, level) : null
          const unlocked = Boolean(levelProgress?.unlocked)

          return (
            <article
              key={level.id}
              className={cn(
                'rounded-[1.75rem] bg-white/85 p-5 ring-1 ring-ink/5',
                !unlocked && 'opacity-75',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold">
                    {level.icon} {worldWord} {level.order}: {level.title}
                  </h2>
                  <p className="font-semibold text-ink-soft">{level.subtitle}</p>
                  {levelProgress ? (
                    <p className="mt-2 text-sm font-bold text-teal">
                      {levelProgress.completedLessons}/{levelProgress.totalLessons} lecciones ·{' '}
                      {levelProgress.stars} estrellas
                    </p>
                  ) : null}
                </div>
                <span className="rounded-xl bg-sand px-3 py-1 text-sm font-bold">
                  {unlocked ? 'Disponible' : 'Bloqueado'}
                </span>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {level.lessonIds.map((lessonId) => {
                  const lesson =
                    game.id === 'reading'
                      ? getReadingLesson(lessonId, state.contentBank, age)
                      : game.id === 'typing'
                        ? getTypingLesson(lessonId)
                        : game.id === 'wordsearch'
                          ? getWordSearchLesson(lessonId)
                          : getSubjectLesson(game.id, lessonId)
                  const lessonProgress = progress?.lessonProgress[lessonId]
                  const lessonUnlocked = Boolean(lessonProgress?.unlocked) && unlocked

                  return (
                    <Button
                      key={lessonId}
                      variant={lessonUnlocked ? 'primary' : 'secondary'}
                      disabled={!lessonUnlocked}
                      onClick={() => {
                        if (game.id === 'wordsearch') {
                          navigate(`/games/sopa-de-letras/play/${lessonId}`)
                          return
                        }
                        navigate(`/games/${game.slug}/lesson/${lessonId}`)
                      }}
                    >
                      {lesson?.title ?? lessonId}
                      {lessonProgress && lessonProgress.stars > 0
                        ? ` · ${'⭐'.repeat(lessonProgress.stars)}`
                        : ''}
                    </Button>
                  )
                })}
              </div>
            </article>
          )
        })}
      </div>
    </PageShell>
  )
}
