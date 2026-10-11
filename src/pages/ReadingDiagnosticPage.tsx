import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { useApp } from '@/context/AppContext'
import { ListenButton } from '@/components/reading/ListenButton'
import { getReadingWorld } from '@/data/games/reading/levels'
import { placementSummary, recommendWorldFromScores, type DiagnosticScores } from '@/domain/reading/placement'

interface DiagnosticItem {
  id: string
  group: keyof DiagnosticScores
  prompt: string
  speak: string
  options: string[]
  answer: string
}

const ITEMS: DiagnosticItem[] = [
  { id: 's1', group: 'sounds', prompt: 'Escucha y elige la palabra.', speak: 'sol', options: ['SOL', 'LUNA', 'MAR'], answer: 'SOL' },
  { id: 's2', group: 'sounds', prompt: '¿Qué palabra rima con sol?', speak: 'sol', options: ['COL', 'PAN', 'MESA'], answer: 'COL' },
  { id: 'l1', group: 'letters', prompt: '¿Qué letra es esta?', speak: 'a', options: ['A', 'E', 'I'], answer: 'A' },
  { id: 'l2', group: 'letters', prompt: '¿Con qué sonido empieza mamá?', speak: 'mamá', options: ['M', 'P', 'S'], answer: 'M' },
  { id: 'y1', group: 'syllables', prompt: '¿Cuántas sílabas tiene casa? ca-sa', speak: 'ca-sa', options: ['1', '2', '3'], answer: '2' },
  { id: 'y2', group: 'syllables', prompt: '¿Qué palabra se forma con ma y má?', speak: 'ma, má', options: ['MAMÁ', 'MESA', 'MAPA'], answer: 'MAMÁ' },
  { id: 'w1', group: 'words', prompt: 'Elige la palabra de la imagen del sol.', speak: '¿Cuál es la palabra sol?', options: ['SOL', 'SAL', 'SEL'], answer: 'SOL' },
  { id: 'o1', group: 'sentences', prompt: 'El sol es amarillo. ¿De qué color es?', speak: 'El sol es amarillo.', options: ['AMARILLO', 'AZUL', 'ROJO'], answer: 'AMARILLO' },
]

function ratio(correct: number, total: number) {
  if (total === 0) return 0
  return correct / total
}

export function ReadingDiagnosticPage() {
  const navigate = useNavigate()
  const { ready, activeProfile, saveReadingPlacement } = useApp()
  const [index, setIndex] = useState(0)
  const [correctByGroup, setCorrectByGroup] = useState<Record<keyof DiagnosticScores, number>>({
    sounds: 0,
    letters: 0,
    syllables: 0,
    words: 0,
    sentences: 0,
  })
  const [seenByGroup, setSeenByGroup] = useState<Record<keyof DiagnosticScores, number>>({
    sounds: 0,
    letters: 0,
    syllables: 0,
    words: 0,
    sentences: 0,
  })
  const [resultWorldId, setResultWorldId] = useState<string | null>(null)

  const item = ITEMS[index]

  if (!ready) {
    return (
      <PageShell>
        <p className="font-display text-2xl font-bold">Cargando…</p>
      </PageShell>
    )
  }
  if (!activeProfile) return <Navigate to="/" replace />

  const finish = (nextScores: DiagnosticScores) => {
    const worldId = recommendWorldFromScores(nextScores)
    const summary = placementSummary(worldId)
    saveReadingPlacement({
      completedAt: new Date().toISOString(),
      recommendedWorldId: worldId,
      summary,
    })
    setResultWorldId(worldId)
  }

  const answer = (value: string) => {
    if (!item) return
    const nextCorrect = { ...correctByGroup, [item.group]: correctByGroup[item.group] + (value === item.answer ? 1 : 0) }
    const nextSeen = { ...seenByGroup, [item.group]: seenByGroup[item.group] + 1 }
    setCorrectByGroup(nextCorrect)
    setSeenByGroup(nextSeen)
    const nextScores: DiagnosticScores = {
      sounds: ratio(nextCorrect.sounds, nextSeen.sounds),
      letters: ratio(nextCorrect.letters, nextSeen.letters),
      syllables: ratio(nextCorrect.syllables, nextSeen.syllables),
      words: ratio(nextCorrect.words, nextSeen.words),
      sentences: ratio(nextCorrect.sentences, nextSeen.sentences),
    }
    const nextIndex = index + 1
    const stop =
      (nextIndex >= 4 && (nextScores.sounds < 0.5 || nextScores.letters < 0.5)) ||
      (nextIndex >= 6 && nextScores.syllables < 0.5) ||
      nextIndex >= ITEMS.length
    if (stop) {
      finish(nextScores)
      return
    }
    setIndex(nextIndex)
  }

  if (resultWorldId) {
    const world = getReadingWorld(resultWorldId)
    return (
      <PageShell>
        <TopBar backTo="/games/aprende-a-leer" backLabel="Mapa" />
        <section className="rounded-[2rem] bg-white/90 p-6 text-center ring-1 ring-ink/5">
          <p className="text-5xl" aria-hidden="true">
            {world?.icon ?? '⭐'}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold">Listo, {activeProfile.name}</h1>
          <p className="mx-auto mt-3 max-w-xl text-lg font-semibold text-ink-soft">
            {placementSummary(world?.id ?? 'reading-sonidos')}
          </p>
          <p className="mt-2 font-bold text-teal">Empezamos en {world?.title}.</p>
          <Button className="mt-6" onClick={() => navigate('/games/aprende-a-leer')}>
            Ir al mapa
          </Button>
        </section>
      </PageShell>
    )
  }

  if (!item) return null

  return (
    <PageShell>
      <TopBar backTo="/games/aprende-a-leer" backLabel="Mapa" />
      <section className="rounded-[2rem] bg-white/90 p-6 ring-1 ring-ink/5">
        <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">
          Juego de inicio · {index + 1}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">{item.prompt}</h1>
        <div className="mt-4">
          <ListenButton text={item.speak} />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {item.options.map((option) => (
            <Button key={option} variant="sunny" size="xl" className="font-display text-3xl" onClick={() => answer(option)}>
              {option}
            </Button>
          ))}
        </div>
        <p className="mt-4 text-center text-sm font-semibold text-ink-soft">No hay prisa. Puedes escuchar otra vez.</p>
      </section>
    </PageShell>
  )
}
