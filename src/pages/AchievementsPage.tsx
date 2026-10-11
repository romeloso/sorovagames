import { Navigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { PageShell } from '@/components/ui/PageShell'
import { useApp } from '@/context/AppContext'
import { ACHIEVEMENTS } from '@/data/achievements'
import { cn } from '@/lib/cn'

export function AchievementsPage() {
  const { ready, activeProfile } = useApp()
  if (!ready) {
    return (
      <PageShell>
        <p className="font-display text-2xl font-bold">Cargando…</p>
      </PageShell>
    )
  }
  if (!activeProfile) return <Navigate to="/" replace />

  return (
    <PageShell>
      <TopBar backTo="/dashboard" backLabel="Dashboard" />
      <h1 className="mb-2 font-display text-4xl font-bold">🏆 Logros de {activeProfile.name}</h1>
      <p className="mb-6 font-semibold text-ink-soft">
        Cada logro celebra tu esfuerzo. ¡Sigue jugando!
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = activeProfile.achievements.includes(achievement.id)
          return (
            <article
              key={achievement.id}
              className={cn(
                'rounded-3xl p-5 ring-1',
                unlocked ? 'bg-sun/40 ring-sun/50' : 'bg-white/70 ring-ink/10 opacity-70',
              )}
            >
              <p className="text-4xl" aria-hidden="true">
                {achievement.icon}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">{achievement.title}</h2>
              <p className="font-semibold text-ink-soft">{achievement.description}</p>
              <p className="mt-3 text-sm font-bold">{unlocked ? 'Desbloqueado' : 'Bloqueado'}</p>
            </article>
          )
        })}
      </div>
    </PageShell>
  )
}
