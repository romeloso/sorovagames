/**
 * Load test del cliente Sorova Games.
 *
 * Escenario A — CPU: filtrar topics/lecciones + stringify estado liviano.
 * Escenario B — Persistencia: stringify estado con avatares base64 grandes (localStorage).
 *
 * Criterio de lentitud: p95 > 100ms (CPU) o p95 > 50ms por save pesado / drop > 40%.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import path from 'node:path'

const OUT = path.resolve('docs/load-test-report.json')
const SLOW_P95_MS = 100
const HEAVY_SAVE_P95_MS = 50
const USER_STEPS = [1, 5, 10, 25, 50, 100, 200, 400]

function makeBank(size = 200) {
  const words = Array.from({ length: size }, (_, i) => ({
    id: `w${i}`,
    word: `PALABRA${i}`,
    distractors: ['A', 'B'],
    minAge: 3 + (i % 5),
    maxAge: 8 + (i % 5),
    createdAt: new Date().toISOString(),
  }))
  const topics = Array.from({ length: size }, (_, i) => ({
    id: `t${i}`,
    subjectId: i % 2 === 0 ? 'reading' : 'typing',
    title: `Tema ${i}`,
    description: `Desc ${i}`,
    minAge: 3 + (i % 5),
    maxAge: 8 + (i % 5),
    reinforce: i % 3 === 0,
    createdAt: new Date().toISOString(),
  }))
  const passages = Array.from({ length: Math.floor(size / 4) }, (_, i) => ({
    id: `p${i}`,
    title: `Historia ${i}`,
    text: 'Había una vez '.repeat(20),
    question: '¿Quién?',
    options: ['A', 'B', 'C'],
    answer: 'A',
    minAge: 4,
    maxAge: 10,
    createdAt: new Date().toISOString(),
  }))
  return { words, passages, topics, avatarLibrary: [] }
}

function topicFitsAge(item, age) {
  if (age == null) return true
  return age >= item.minAge && age <= item.maxAge
}

function buildLessons(bank, age) {
  const words = bank.words.filter((item) => topicFitsAge(item, age)).slice(0, 12)
  return words.map((word, index) => ({
    id: `lesson-${word.id}-${index}`,
    activities: [
      { kind: 'word_quiz', answer: word.word, options: [word.word, ...word.distractors] },
    ],
  }))
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
  return sorted[idx]
}

async function runCpuUser(bank, ops = 20) {
  const latencies = []
  for (let i = 0; i < ops; i += 1) {
    const age = 3 + (i % 10)
    const start = performance.now()
    const lessons = buildLessons(bank, age)
    const topics = bank.topics.filter((t) => topicFitsAge(t, age) && t.subjectId === 'reading')
    const state = {
      version: 3,
      profiles: { u1: { id: 'u1', name: 'User', birthDate: '2018-01-01', avatarImage: 'x'.repeat(200) } },
      contentBank: { ...bank, topics: topics.slice(0, 30) },
      progress: { u1: { reading: { lessonProgress: {}, stats: {} } } },
      lessons,
    }
    JSON.stringify(state)
    latencies.push(performance.now() - start)
  }
  return latencies
}

/** Simula N perfiles con foto ~120KB (JPEG data URL comprimido típico). */
async function runHeavyPersistUser(profileCount, ops = 10) {
  const avatar = `data:image/jpeg;base64,${'A'.repeat(120_000)}`
  const profiles = Object.fromEntries(
    Array.from({ length: profileCount }, (_, i) => [
      `c${i}`,
      {
        id: `c${i}`,
        name: `Niño ${i}`,
        avatarImage: avatar,
        birthDate: '2018-01-01',
      },
    ]),
  )
  const library = Array.from({ length: Math.min(profileCount, 40) }, (_, i) => ({
    id: `a${i}`,
    label: `Foto ${i}`,
    src: avatar,
  }))
  const state = {
    version: 3,
    profiles,
    contentBank: { words: [], passages: [], topics: [], avatarLibrary: library },
    progress: Object.fromEntries(Object.keys(profiles).map((id) => [id, { reading: {}, typing: {} }])),
  }

  const latencies = []
  let bytes = 0
  for (let i = 0; i < ops; i += 1) {
    const start = performance.now()
    const payload = JSON.stringify(state)
    bytes = payload.length
    latencies.push(performance.now() - start)
  }
  return { latencies, bytes }
}

async function runConcurrency(users, bank) {
  const start = performance.now()
  const batches = await Promise.all(Array.from({ length: users }, () => runCpuUser(bank)))
  const all = batches.flat().sort((a, b) => a - b)
  const elapsed = performance.now() - start
  const ops = all.length
  return {
    users,
    ops,
    elapsedMs: Number(elapsed.toFixed(2)),
    opsPerSec: Number((ops / (elapsed / 1000)).toFixed(2)),
    p50Ms: Number(percentile(all, 50).toFixed(3)),
    p95Ms: Number(percentile(all, 95).toFixed(3)),
    p99Ms: Number(percentile(all, 99).toFixed(3)),
    maxMs: Number((all[all.length - 1] ?? 0).toFixed(3)),
  }
}

async function main() {
  const bank = makeBank(250)
  const cpuResults = []
  let baselineOps = null
  let slowAt = null

  for (const users of USER_STEPS) {
    const sample = await runConcurrency(users, bank)
    cpuResults.push(sample)
    if (baselineOps == null) baselineOps = sample.opsPerSec
    const throughputDrop = baselineOps ? (baselineOps - sample.opsPerSec) / baselineOps : 0
    const isSlow = sample.p95Ms > SLOW_P95_MS || throughputDrop > 0.4
    if (isSlow && slowAt == null) {
      slowAt = {
        users,
        reason:
          sample.p95Ms > SLOW_P95_MS
            ? `p95 ${sample.p95Ms}ms > ${SLOW_P95_MS}ms`
            : `throughput cayó ${(throughputDrop * 100).toFixed(1)}% vs baseline`,
        sample,
      }
    }
  }

  const heavySteps = [3, 6, 10, 15, 20, 30]
  const heavyResults = []
  let heavySlowAt = null
  for (const profiles of heavySteps) {
    const { latencies, bytes } = await runHeavyPersistUser(profiles)
    const sorted = [...latencies].sort((a, b) => a - b)
    const sample = {
      profiles,
      approxPayloadKB: Number((bytes / 1024).toFixed(1)),
      p50Ms: Number(percentile(sorted, 50).toFixed(3)),
      p95Ms: Number(percentile(sorted, 95).toFixed(3)),
      maxMs: Number((sorted[sorted.length - 1] ?? 0).toFixed(3)),
      exceedsLocalStorageSoftLimit: bytes > 4.5 * 1024 * 1024,
    }
    heavyResults.push(sample)
    if (
      heavySlowAt == null &&
      (sample.p95Ms > HEAVY_SAVE_P95_MS || sample.exceedsLocalStorageSoftLimit)
    ) {
      heavySlowAt = {
        profiles,
        reason: sample.exceedsLocalStorageSoftLimit
          ? `payload ~${sample.approxPayloadKB}KB supera soft-limit 4.5MB de localStorage`
          : `p95 save ${sample.p95Ms}ms > ${HEAVY_SAVE_P95_MS}ms`,
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    environment: 'node-client-simulation',
    note:
      'Simula carga de CPU y memoria del cliente. No mide la red ni PostgreSQL.',
    thresholds: {
      cpuSlowP95Ms: SLOW_P95_MS,
      heavySaveP95Ms: HEAVY_SAVE_P95_MS,
      throughputDropPct: 40,
    },
    cpuScenario: {
      baselineOpsPerSec: baselineOps,
      becomesSlowAroundUsers: slowAt?.users ?? null,
      slowReason: slowAt?.reason ?? 'No se alcanzó umbral en el rango probado (hasta 400 usuarios)',
      results: cpuResults,
    },
    heavyPersistScenario: {
      becomesSlowAroundProfiles: heavySlowAt?.profiles ?? null,
      slowReason:
        heavySlowAt?.reason ??
        'No se alcanzó umbral con el rango de perfiles/avatares probado',
      results: heavyResults,
    },
    recommendation: [
      slowAt == null
        ? 'CPU/filtrado: ≥400 usuarios concurrentes simulados sin cruzar p95 100ms.'
        : `CPU/filtrado: se pone lenta ~${slowAt.users} usuarios (${slowAt.reason}).`,
      heavySlowAt == null
        ? 'Persistencia con avatares: estable en el rango probado.'
        : `Persistencia: se degrada ~${heavySlowAt.profiles} perfiles con fotos base64 (${heavySlowAt.reason}). Las fotos se comprimen en un worker y el guardado va diferido.`,
      'La copia local sigue limitada por localStorage. El documento de producción vive en PostgreSQL.',
    ].join(' '),
  }

  mkdirSync(path.dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  console.log(`\nLOAD_TEST_OK report=${OUT}`)
  console.log(
    `CPU_SLOW_USERS=${slowAt?.users ?? '>=400'} HEAVY_SLOW_PROFILES=${heavySlowAt?.profiles ?? 'n/a'}`,
  )
}

main().catch((error) => {
  console.error('LOAD_TEST_FAIL', error)
  process.exit(1)
})
