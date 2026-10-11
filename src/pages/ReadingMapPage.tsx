import { Navigate, useNavigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { SmilingStar } from '@/components/brand/SmilingStar'
import { Button } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { useApp } from '@/context/AppContext'
import { getAvailableReadingLevels, getReadingLesson, getReadingWorld } from '@/data/games/reading/levels'
import { recommendNextLessonId } from '@/domain/reading/mastery'
import { getLevelProgress } from '@/domain/progress'
import { ageFromBirthDate } from '@/lib/age'
import { effectiveLearningAge } from '@/lib/grade'
import { cn } from '@/lib/cn'
export function ReadingMapPage() {
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
  const levels = getAvailableReadingLevels(state.contentBank, age, grade)
  const lessons = levels.flatMap((level) =>
    level.lessonIds
      .map((lessonId) => getReadingLesson(lessonId, state.contentBank, age, grade))
      .filter((lesson) => lesson != null),
  )
  const progress = getGameProgress('reading')
  const nextLessonId = recommendNextLessonId(progress, levels, lessons)
  const nextLesson = nextLessonId ? getReadingLesson(nextLessonId, state.contentBank, age, grade) : undefined
  const nextWorld = nextLesson ? getReadingWorld(nextLesson.levelId) : undefined

  return (
    <PageShell>
      <TopBar backTo="/dashboard" backLabel="Inicio" />
      <section className="mb-6 rounded-[2rem] bg-navy p-6 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white/70">Leo y Escribo</p>
            <h1 className="mt-1 font-display text-4xl font-bold">Hola, {activeProfile.name}</h1>
            <p className="mt-2 max-w-xl text-base font-semibold text-white/80">
              Toca el botón grande y sigue tu camino.
            </p>
          </div>
          <SmilingStar size={64} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="sunny"
            disabled={!nextLesson}
            onClick={() => nextLesson && navigate(`/games/aprende-a-leer/lesson/${nextLesson.id}`)}
          >
            Continuar aprendiendo
            {nextWorld ? ` · ${nextWorld.icon}` : ''}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/games/aprende-a-leer/diagnostico')}>
            Juego de inicio
          </Button>
          <Button variant="secondary" onClick={() => navigate('/familia')}>
            Informe familiar
          </Button>
        </div>
        {nextLesson ? (
          <p className="mt-3 text-sm font-bold text-sun">Siguiente: {nextLesson.title}</p>
        ) : null}
      </section>

      <div className="space-y-4">
        {levels.map((level) => {
          const world = getReadingWorld(level.id)
          const levelProgress = progress ? getLevelProgress(progress, level) : null
          const unlocked = Boolean(levelProgress?.unlocked)
          return (
            <article
              key={level.id}
              className={cn('rounded-[1.75rem] bg-white/90 p-5 ring-1 ring-ink/5', !unlocked && 'opacity-80')}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold">
                    <span aria-hidden="true">{level.icon} </span>
                    {level.title}
                  </h2>
                  <p className="font-semibold text-ink-soft">{level.subtitle}</p>
                  {levelProgress ? (
                    <p className="mt-2 text-sm font-bold text-teal">
                      {levelProgress.completedLessons}/{levelProgress.totalLessons} lecciones · {levelProgress.stars}{' '}
                      estrellas
                    </p>
                  ) : null}
                </div>
                <span
                  className="rounded-xl px-3 py-1 text-sm font-bold text-white"
                  style={{ backgroundColor: world?.accent ?? '#6366f1' }}
                >
                  {unlocked ? 'Disponible' : 'Todavía no'}
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {level.lessonIds.map((lessonId) => {
                  const lesson = getReadingLesson(lessonId, state.contentBank, age, grade)
                  const lessonProgress = progress?.lessonProgress[lessonId]
                  const lessonUnlocked = Boolean(lessonProgress?.unlocked) && unlocked
                  return (
                    <Button
                      key={lessonId}
                      variant={lessonUnlocked ? 'primary' : 'secondary'}
                      disabled={!lessonUnlocked}
                      onClick={() => navigate(`/games/aprende-a-leer/lesson/${lessonId}`)}
                    >
                      {lesson?.title ?? lessonId}
                      {lessonProgress && lessonProgress.stars > 0 ? ` · ${'⭐'.repeat(lessonProgress.stars)}` : ''}
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
