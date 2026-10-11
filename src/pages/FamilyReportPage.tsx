import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { useApp } from '@/context/AppContext'
import { skillTitleMap } from '@/data/games/reading/curriculum'
import { getReadingWorld } from '@/data/games/reading/levels'
import { getGameById } from '@/data/games/registry'
import { SUBJECT_GAME_IDS, subjectSkillTitles } from '@/data/subjects/catalog'
import { familyNarrative, familySkillLines } from '@/domain/reading/report'
import type { GameId, ReadingStats, SubjectStats } from '@/types'

const SUBJECTS: Array<{ id: GameId; label: string }> = [
  { id: 'reading', label: 'Lectura y escritura' },
  ...SUBJECT_GAME_IDS.map((id) => ({ id, label: getGameById(id)?.title ?? id })),
]

export function FamilyReportPage() {
  const { ready, activeProfile, getGameProgress } = useApp()
  const [adult, setAdult] = useState(false)

  if (!ready) {
    return (
      <PageShell>
        <p className="font-display text-2xl font-bold">Cargando…</p>
      </PageShell>
    )
  }
  if (!activeProfile) return <Navigate to="/" replace />

  const readingStats = getGameProgress('reading')?.stats as ReadingStats | undefined
  const world = readingStats?.placement ? getReadingWorld(readingStats.placement.recommendedWorldId) : undefined

  return (
    <PageShell>
      <TopBar backTo="/dashboard" backLabel="Inicio" />
      <section className="rounded-[2rem] bg-white/90 p-6 ring-1 ring-ink/5">
        <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">Para la familia</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Informe de {activeProfile.name}</h1>
        <p className="mt-2 font-semibold text-ink-soft">
          Esto no es una evaluación clínica ni una certificación. Describe la práctica dentro de Sorova Games.
        </p>
        {!adult ? (
          <Button className="mt-6" onClick={() => setAdult(true)}>
            Soy una persona adulta
          </Button>
        ) : (
          <div className="mt-6 space-y-6">
            {SUBJECTS.map((subject) => {
              const stats = getGameProgress(subject.id)?.stats as ReadingStats | SubjectStats | undefined
              const titles = subject.id === 'reading' ? skillTitleMap() : subjectSkillTitles(subject.id)
              const lines = familySkillLines(stats, titles)
              const lessons =
                stats && 'lessonsCompleted' in stats ? stats.lessonsCompleted : 0
              return (
                <article key={subject.id} className="rounded-3xl bg-sand/70 p-4">
                  <h2 className="font-display text-2xl font-bold">{subject.label}</h2>
                  <p className="mt-2 font-semibold leading-relaxed text-ink">
                    {familyNarrative(activeProfile.name, stats, titles, subject.label)}
                  </p>
                  {subject.id === 'reading' && world ? (
                    <p className="mt-2 font-bold text-teal">
                      Punto de partida sugerido en lectura: {world.icon} {world.title}
                    </p>
                  ) : null}
                  <ul className="mt-3 space-y-2">
                    {lines.length === 0 ? (
                      <li className="rounded-2xl bg-white px-4 py-3 font-semibold">Aún no hay habilidades registradas.</li>
                    ) : (
                      lines.map((line) => (
                        <li key={line.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                          <span className="font-bold">{line.title}</span>
                          <span className="rounded-xl bg-sand px-3 py-1 text-sm font-bold text-ink">{line.label}</span>
                        </li>
                      ))
                    )}
                  </ul>
                  <p className="mt-3 text-sm font-semibold text-ink-soft">Lecciones hechas: {lessons}.</p>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}
