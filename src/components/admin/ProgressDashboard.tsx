import { useMemo, useState } from 'react'
import type { SortDirection } from '@/domain/childDirectory'
import {
  EMPTY_PROGRESS_FILTERS,
  filterProgressDashboard,
  sortProgressDashboard,
  summarizeProgress,
  type ProgressDashboardFilters,
  type ProgressDashboardRow,
  type ProgressSortKey,
} from '@/domain/progressDashboard'
import { formatNumber, formatPercent, formatWpm } from '@/lib/format'
import { SCHOOL_GRADES } from '@/lib/grade'
import type { TutorAccount } from '@/types'

const COLUMNS: Array<{ key: ProgressSortKey; label: string }> = [
  { key: 'name', label: 'Niño' },
  { key: 'level', label: 'Nivel' },
  { key: 'age', label: 'Edad' },
  { key: 'grade', label: 'Grado' },
  { key: 'tutor', label: 'Tutor a cargo' },
  { key: 'xp', label: 'XP' },
  { key: 'coins', label: 'Monedas' },
  { key: 'streak', label: 'Racha' },
  { key: 'achievements', label: 'Logros' },
  { key: 'reading', label: 'Lectura' },
  { key: 'words', label: 'Palabras' },
  { key: 'lessons', label: 'Lecciones' },
  { key: 'typing', label: 'Tecleo' },
  { key: 'wpm', label: 'Velocidad' },
  { key: 'accuracy', label: 'Precisión' },
]

const selectClass = 'rounded-xl border-2 border-ink/10 bg-white px-3 py-2 text-sm font-bold'

export function ProgressDashboard({
  rows,
  tutors,
}: {
  rows: ProgressDashboardRow[]
  tutors: TutorAccount[]
}) {
  const [filters, setFilters] = useState<ProgressDashboardFilters>(EMPTY_PROGRESS_FILTERS)
  const [sortKey, setSortKey] = useState<ProgressSortKey>('name')
  const [direction, setDirection] = useState<SortDirection>('asc')
  const levels = useMemo(() => [...new Set(rows.map((row) => row.level))].sort((left, right) => left - right), [rows])

  const visible = useMemo(
    () => sortProgressDashboard(filterProgressDashboard(rows, filters), sortKey, direction),
    [direction, filters, rows, sortKey],
  )
  const summary = useMemo(() => summarizeProgress(visible), [visible])

  const filtersActive = Object.entries(filters).some(([key, value]) =>
    key === 'query' ? String(value).trim() !== '' : value !== 'all',
  )

  function toggleSort(key: ProgressSortKey) {
    if (sortKey === key) {
      setDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setDirection(key === 'name' || key === 'tutor' || key === 'grade' ? 'asc' : 'desc')
  }

  const tiles = [
    { label: 'Niños', value: formatNumber(summary.count) },
    { label: 'XP', value: formatNumber(summary.xp) },
    { label: 'Monedas', value: formatNumber(summary.coins) },
    { label: 'Racha media', value: `${formatNumber(Math.round(summary.averageStreak))} días` },
    { label: 'Logros', value: formatNumber(summary.achievements) },
    { label: 'Lecciones de lectura', value: formatNumber(summary.readingLessons) },
    { label: 'Precisión media', value: formatPercent(summary.averageAccuracy) },
  ]

  return (
    <section className="rounded-[1.75rem] bg-white/90 p-5 ring-1 ring-ink/5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Progreso de los niños</h2>
          <p className="text-sm font-semibold text-ink-soft">
            {visible.length} de {rows.length} {rows.length === 1 ? 'perfil' : 'perfiles'}. Los totales siguen a los
            filtros. Toca una columna para ordenar.
          </p>
        </div>
        {filtersActive ? (
          <button
            type="button"
            className="rounded-xl px-3 py-2 text-sm font-bold text-teal"
            onClick={() => setFilters(EMPTY_PROGRESS_FILTERS)}
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <article key={tile.label} className="rounded-2xl bg-sand/70 px-4 py-3">
            <p className="text-sm font-bold text-ink-soft">{tile.label}</p>
            <p className="font-display text-2xl font-bold">{tile.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="block text-sm font-bold text-ink-soft sm:col-span-2 xl:col-span-4">
          Buscar
          <input
            className={`${selectClass} mt-1 w-full`}
            value={filters.query}
            placeholder="Nombre, nivel, grado, tutor o XP"
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
          />
        </label>
        <label className="block text-sm font-bold text-ink-soft">
          Grado
          <select
            className={`${selectClass} mt-1 w-full`}
            value={filters.grade}
            onChange={(event) =>
              setFilters((current) => ({ ...current, grade: event.target.value as ProgressDashboardFilters['grade'] }))
            }
          >
            <option value="all">Todos los grados</option>
            <option value="none">Sin grado</option>
            {SCHOOL_GRADES.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold text-ink-soft">
          Filtrar por tutor
          <select
            className={`${selectClass} mt-1 w-full`}
            value={filters.tutorId}
            onChange={(event) => setFilters((current) => ({ ...current, tutorId: event.target.value }))}
          >
            <option value="all">Todos los tutores</option>
            <option value="none">Sin tutor</option>
            {tutors.map((tutor) => (
              <option key={tutor.id} value={tutor.id}>
                {tutor.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold text-ink-soft">
          Nivel
          <select
            className={`${selectClass} mt-1 w-full`}
            value={filters.level}
            onChange={(event) =>
              setFilters((current) => ({ ...current, level: event.target.value as ProgressDashboardFilters['level'] }))
            }
          >
            <option value="all">Todos los niveles</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                Nivel {level}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold text-ink-soft">
          Racha
          <select
            className={`${selectClass} mt-1 w-full`}
            value={filters.streak}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                streak: event.target.value as ProgressDashboardFilters['streak'],
              }))
            }
          >
            <option value="all">Con o sin racha</option>
            <option value="active">Con racha</option>
            <option value="none">Sin racha</option>
          </select>
        </label>
        <label className="block text-sm font-bold text-ink-soft">
          Lectura
          <select
            className={`${selectClass} mt-1 w-full`}
            value={filters.reading}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                reading: event.target.value as ProgressDashboardFilters['reading'],
              }))
            }
          >
            <option value="all">Cualquier avance</option>
            <option value="none">Sin empezar</option>
            <option value="started">En camino, menos del 50 %</option>
            <option value="advanced">Desde el 50 %</option>
          </select>
        </label>
        <label className="block text-sm font-bold text-ink-soft">
          Tecleo
          <select
            className={`${selectClass} mt-1 w-full`}
            value={filters.typing}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                typing: event.target.value as ProgressDashboardFilters['typing'],
              }))
            }
          >
            <option value="all">Cualquier avance</option>
            <option value="none">Sin empezar</option>
            <option value="started">En camino, menos del 50 %</option>
            <option value="advanced">Desde el 50 %</option>
          </select>
        </label>
        <label className="block text-sm font-bold text-ink-soft">
          Logros
          <select
            className={`${selectClass} mt-1 w-full`}
            value={filters.achievements}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                achievements: event.target.value as ProgressDashboardFilters['achievements'],
              }))
            }
          >
            <option value="all">Con o sin logros</option>
            <option value="some">Con logros</option>
            <option value="none">Sin logros</option>
          </select>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[1280px] border-separate border-spacing-0 text-left text-sm">
          <caption className="sr-only">
            Nivel, edad, grado, tutor, XP, monedas, racha, logros, lectura y tecleo de cada niño
          </caption>
          <thead>
            <tr>
              {COLUMNS.map((column) => {
                const active = sortKey === column.key
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className="whitespace-nowrap border-b border-ink/10 px-3 py-2"
                  >
                    <button type="button" className="font-bold text-ink" onClick={() => toggleSort(column.key)}>
                      {column.label}
                      {active ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-3 py-6 font-semibold text-ink-soft">
                  Ningún niño coincide con estos filtros.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="hover:bg-sand/60">
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-bold">{row.name}</td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">Nivel {row.level}</td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">{row.ageLabel}</td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">{row.gradeLabel}</td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">{row.tutorName}</td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">{formatNumber(row.xp)}</td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">{formatNumber(row.coins)}</td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">{row.streakDays} días</td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">{row.achievements}</td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">
                    {formatPercent(row.readingProgress)}
                  </td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">{row.wordsLearned}</td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">{row.readingLessons}</td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">
                    {formatPercent(row.typingProgress)}
                  </td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">{formatWpm(row.typingWpm)}</td>
                  <td className="whitespace-nowrap border-b border-ink/5 px-3 py-3 font-semibold">
                    {formatPercent(row.typingAccuracy)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
