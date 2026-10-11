import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useCelebration } from '@/components/feedback/Celebration'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { useApp } from '@/context/AppContext'
import { getGameById } from '@/data/games/registry'
import { formatNumber, formatPercent, formatWpm } from '@/lib/format'
import type { AdaptiveHint, LessonSessionResult, RewardPayload } from '@/types'

interface ResultState {
  result: LessonSessionResult
  reward: RewardPayload
  adaptive: AdaptiveHint
}

export function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeProfile } = useApp()
  const state = location.state as ResultState | null

  useCelebration(Boolean(state))

  if (!activeProfile) return <Navigate to="/" replace />
  if (!state) return <Navigate to="/dashboard" replace />

  const game = getGameById(state.result.gameId)

  return (
    <PageShell>
      <TopBar backTo="/dashboard" backLabel="Dashboard" />
      <section className="rounded-[2rem] bg-card/90 p-6 text-center shadow-[0_16px_40px_rgba(31,42,55,0.1)] sm:p-10">
        <p className="text-6xl" aria-hidden="true">
          🎉
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink">¡Excelente, {activeProfile.name}!</h1>
        <p className="mt-2 text-lg font-semibold text-ink-soft">
          Completaste una lección de {game?.title ?? 'juego'}
        </p>

        <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-3 text-left">
          <div className="rounded-2xl bg-sun/50 p-4 text-navy">
            <p className="text-sm font-bold text-navy/70">XP</p>
            <p className="font-display text-3xl font-bold">+{formatNumber(state.reward.xp)}</p>
          </div>
          <div className="rounded-2xl bg-mint/60 p-4 text-navy">
            <p className="text-sm font-bold text-navy/70">Monedas</p>
            <p className="font-display text-3xl font-bold">+{formatNumber(state.reward.coins)}</p>
          </div>
          <div className="rounded-2xl bg-sky/30 p-4 text-navy">
            <p className="text-sm font-bold text-navy/70">Precisión</p>
            <p className="font-display text-3xl font-bold">{formatPercent(state.result.accuracy)}</p>
          </div>
          <div className="rounded-2xl bg-coral/20 p-4 text-navy">
            <p className="text-sm font-bold text-navy/70">Estrellas</p>
            <p className="font-display text-3xl font-bold">
              {'⭐'.repeat(state.result.stars) || '—'}
            </p>
          </div>
        </div>

        {typeof state.result.wpm === 'number' ? (
          <p className="mt-4 font-bold text-teal">Velocidad: {formatWpm(state.result.wpm)}</p>
        ) : null}

        {state.reward.leveledUp ? (
          <p className="mt-4 rounded-2xl bg-teal px-4 py-3 font-display text-2xl font-bold text-white">
            ¡Subiste al nivel {state.reward.newLevel}!
          </p>
        ) : null}

        {state.reward.achievements.length > 0 ? (
          <div className="mt-5 space-y-2">
            {state.reward.achievements.map((achievement) => (
              <p
                key={achievement.id}
                className="rounded-2xl bg-sun/60 px-4 py-3 font-bold text-navy"
              >
                🏆 ¡Nuevo logro! {achievement.title}
              </p>
            ))}
          </div>
        ) : null}

        <p className="mt-5 font-semibold text-ink-soft">{state.adaptive.message}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              navigate(`/games/${game?.slug}/lesson/${state.result.lessonId}`)
            }
          >
            Repetir actividad
          </Button>
          <Button
            onClick={() => navigate(`/games/${game?.slug}`)}
          >
            Siguiente reto
          </Button>
          <Button variant="ghost" className="bg-card ring-1 ring-ink/10" onClick={() => navigate('/dashboard')}>
            Ir al inicio
          </Button>
        </div>
      </section>
    </PageShell>
  )
}
