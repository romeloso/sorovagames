import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { GameCard } from '@/components/game/GameCard'
import { TopBar } from '@/components/layout/TopBar'
import { Avatar } from '@/components/profile/Avatar'
import { AvatarUploader } from '@/components/profile/AvatarUploader'
import { Button } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatPill } from '@/components/ui/StatPill'
import { useApp } from '@/context/AppContext'
import { GAME_DEFINITIONS, getGameById } from '@/data/games/registry'
import { getAvailableReadingLevels, getReadingLessons } from '@/data/games/reading/levels'
import { getSubjectLessons, getSubjectLevels, SUBJECT_GAME_IDS } from '@/data/subjects/catalog'
import { recommendNextLessonId } from '@/domain/reading/mastery'
import { ACHIEVEMENTS } from '@/data/achievements'
import { overallGameCompletion } from '@/domain/progress'
import { ageBandFromAge, ageBandLabel, ageFromBirthDate, formatAge } from '@/lib/age'
import {
  difficultyFromGrade,
  effectiveLearningAge,
  formatGrade,
} from '@/lib/grade'
import { formatNumber } from '@/lib/format'
import { xpProgressWithinLevel } from '@/lib/xp'
import { getCachedTopicsForLearner } from '@/services/cache/contentCache'
import type { GameId, GameLevelMeta, LessonDefinition, ReadingStats, TypingStats } from '@/types'

export function DashboardPage() {
  const navigate = useNavigate()
  const { ready, activeProfile, getGameProgress, state, updateProfileAvatar, updateChildProfile } =
    useApp()
  const [editingAvatar, setEditingAvatar] = useState(false)
  const [editingBirthDate, setEditingBirthDate] = useState(false)

  const birthAge = ageFromBirthDate(activeProfile?.birthDate)
  const grade = activeProfile?.grade ?? null
  const age = effectiveLearningAge(birthAge, grade)
  const band = grade != null ? difficultyFromGrade(grade) : ageBandFromAge(age)
  const myTopics = useMemo(
    () => getCachedTopicsForLearner(state.contentBank.topics, { age, grade }),
    [age, grade, state.contentBank.topics],
  )
  const recommendations = useMemo(() => {
    if (!activeProfile) return []
    const readingLevels = getAvailableReadingLevels(state.contentBank, age, grade)
    const catalog: Array<{ id: GameId; levels: GameLevelMeta[]; lessons: LessonDefinition[] }> = [
      {
        id: 'reading',
        levels: readingLevels,
        lessons: getReadingLessons(state.contentBank, age, grade),
      },
      ...SUBJECT_GAME_IDS.map((id) => ({
        id,
        levels: getSubjectLevels(id),
        lessons: getSubjectLessons(id),
      })),
    ]
    return catalog.flatMap((entry) => {
      const game = getGameById(entry.id)
      if (!game) return []
      const progress = state.progress[activeProfile.id]?.[entry.id] ?? null
      const lessonId = recommendNextLessonId(progress, entry.levels, entry.lessons)
      const lesson = entry.lessons.find((item) => item.id === lessonId)
      if (!lessonId || !lesson) return []
      return [
        {
          id: entry.id,
          icon: game.icon,
          label: game.shortTitle,
          title: lesson.title,
          href: `/games/${game.slug}/lesson/${lessonId}`,
        },
      ]
    })
  }, [activeProfile, age, grade, state.contentBank, state.progress])

  if (!ready) {
    return (
      <PageShell>
        <p className="font-display text-2xl font-bold">Cargando…</p>
      </PageShell>
    )
  }
  if (!activeProfile) {
    return <Navigate to="/" replace />
  }

  const xpInfo = xpProgressWithinLevel(activeProfile.xp)
  const reading = getGameProgress('reading')
  const typing = getGameProgress('typing')
  const readingStats = reading?.stats as ReadingStats | undefined
  const typingStats = typing?.stats as TypingStats | undefined
  const ownedAchievements = ACHIEVEMENTS.filter((item) =>
    activeProfile.achievements.includes(item.id),
  )

  return (
    <PageShell wide>
      <TopBar showBackToProfiles />

      <section className="mb-8 rounded-[2rem] bg-white/80 p-5 shadow-[0_12px_30px_rgba(31,42,55,0.08)] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Avatar
              name={activeProfile.name}
              src={activeProfile.avatarImage}
              accent={activeProfile.accent}
              size="lg"
              focus="center"
            />
            <Button
              size="md"
              variant="secondary"
              className="!min-h-10"
              onClick={() => setEditingAvatar((value) => !value)}
            >
              {editingAvatar ? 'Cerrar' : 'Cambiar foto'}
            </Button>
          </div>
          <div className="flex-1 space-y-3">
            <h1 className="font-display text-4xl font-bold text-ink">
              ¡Hola, {activeProfile.name}!
            </h1>
            <p className="text-lg font-bold text-ink-soft">
              Nivel {activeProfile.level} · {formatGrade(activeProfile.grade)} · {formatAge(birthAge)} ·{' '}
              {ageBandLabel(band)}
            </p>
            <ProgressBar
              value={xpInfo.ratio}
              label={`${formatNumber(xpInfo.current)} / ${formatNumber(xpInfo.needed)} XP`}
              colorClassName="bg-coral"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="md"
                variant="secondary"
                className="!min-h-10"
                onClick={() => setEditingBirthDate((value) => !value)}
              >
                {editingBirthDate ? 'Cerrar fecha' : 'Mi fecha de nacimiento'}
              </Button>
              {!activeProfile.birthDate ? (
                <span className="text-sm font-bold text-coral">
                  Pon tu fecha para adaptar los temas a tu edad
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {editingBirthDate ? (
          <div className="mt-5 rounded-[1.5rem] bg-sand/60 p-4 sm:p-5">
            <h2 className="mb-3 font-display text-xl font-bold">Fecha de nacimiento</h2>
            <p className="mb-3 text-sm font-semibold text-ink-soft">
              Con tu edad te mostramos temas y material a tu nivel.
            </p>
            <input
              type="date"
              className="w-full max-w-xs rounded-xl border-2 border-ink/10 px-3 py-2 font-bold"
              value={activeProfile.birthDate ?? ''}
              onChange={(e) =>
                updateChildProfile(activeProfile.id, {
                  birthDate: e.target.value || null,
                })
              }
            />
          </div>
        ) : null}

        {editingAvatar ? (
          <div className="mt-5 rounded-[1.5rem] bg-sand/60 p-4 text-center sm:p-5">
            <h2 className="mb-3 font-display text-xl font-bold">Actualizar foto de perfil</h2>
            <AvatarUploader
              profile={activeProfile}
              library={state.contentBank.avatarLibrary}
              compact
              onSave={(avatarImage) => {
                updateProfileAvatar(activeProfile.id, avatarImage)
                setEditingAvatar(false)
              }}
            />
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatPill icon="⭐" label="XP" value={formatNumber(activeProfile.xp)} />
          <StatPill icon="🪙" label="Monedas" value={formatNumber(activeProfile.coins)} />
          <StatPill icon="🔥" label="Racha" value={`${activeProfile.streakDays} días`} />
          <StatPill icon="🏆" label="Logros" value={ownedAchievements.length} />
        </div>
      </section>

      {myTopics.length > 0 ? (
        <section className="mb-8 rounded-[1.75rem] bg-white/75 p-5 ring-1 ring-ink/5">
          <h2 className="font-display text-2xl font-bold">Temas para ti</h2>
          <p className="mt-1 font-semibold text-ink-soft">
            Adaptados a {formatGrade(activeProfile.grade)}
            {age != null ? ` · ${formatAge(age)}` : ''}
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {myTopics.map((topic) => {
              const game = GAME_DEFINITIONS.find((item) => item.id === topic.subjectId)
              return (
                <li key={topic.id} className="rounded-2xl bg-sand/50 px-4 py-3">
                  <p className="font-bold">
                    {game?.icon} {topic.title}
                    {topic.reinforce ? ' · Refuerzo' : ''}
                  </p>
                  <p className="text-sm font-semibold text-ink-soft">{topic.description}</p>
                  <p className="mt-1 text-xs font-bold text-teal">
                    {game?.shortTitle ?? topic.subjectId}
                  </p>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <section className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.75rem] bg-white/75 p-5 ring-1 ring-ink/5">
          <h2 className="font-display text-2xl font-bold">📚 Leo y Escribo</h2>
          <p className="mt-2 font-semibold text-ink-soft">
            Palabras aprendidas: {readingStats?.wordsLearned.length ?? 0}
          </p>
          <p className="font-semibold text-ink-soft">
            Lecciones: {readingStats?.lessonsCompleted ?? 0}
          </p>
          <ProgressBar
            className="mt-3"
            value={reading ? overallGameCompletion(reading) : 0}
            colorClassName="bg-coral"
          />
          <Button className="mt-4" onClick={() => navigate('/games/aprende-a-leer')}>
            Continuar aprendiendo
          </Button>
        </div>
        <div className="rounded-[1.75rem] bg-white/75 p-5 ring-1 ring-ink/5">
          <h2 className="font-display text-2xl font-bold">⌨️ Tecleo</h2>
          <p className="mt-2 font-semibold text-ink-soft">
            Mejor velocidad: {Math.round(typingStats?.bestWpm ?? 0)} PPM
          </p>
          <p className="font-semibold text-ink-soft">
            Mejor precisión: {Math.round((typingStats?.bestAccuracy ?? 0) * 100)}%
          </p>
          <ProgressBar
            className="mt-3"
            value={typing ? overallGameCompletion(typing) : 0}
            colorClassName="bg-teal"
          />
        </div>
      </section>

      {recommendations.length > 0 ? (
        <section className="mb-8 rounded-[1.75rem] bg-white/75 p-5 ring-1 ring-ink/5">
          <h2 className="font-display text-2xl font-bold">Actividades recomendadas</h2>
          <p className="mt-1 font-semibold text-ink-soft">
            Cada materia avanza por separado. La edad no elige la dificultad.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.href)}
                className="rounded-2xl bg-sand/60 px-4 py-3 text-left"
              >
                <p className="text-sm font-bold text-teal">
                  {item.icon} {item.label}
                </p>
                <p className="font-display text-xl font-bold">{item.title}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => navigate('/progress')}>
          🌟 Mi aventura
        </Button>
        <Button variant="secondary" onClick={() => navigate('/achievements')}>
          🏆 Logros
        </Button>
        <Button variant="secondary" onClick={() => navigate('/familia')}>
          Informe familiar
        </Button>
      </div>

      <section>
        <h2 className="mb-4 font-display text-3xl font-bold">Materias y juegos</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {GAME_DEFINITIONS.map((game) => {
            const progress = state.progress[activeProfile.id]?.[game.id]
            return (
              <GameCard
                key={game.id}
                game={game}
                progressRatio={progress ? overallGameCompletion(progress) : 0}
                onClick={() => navigate(`/games/${game.slug}`)}
              />
            )
          })}
        </div>
      </section>
    </PageShell>
  )
}
