import { useMemo, useState } from 'react'
import { Avatar } from '@/components/profile/Avatar'
import { SCHOOL_GRADES } from '@/lib/grade'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/cn'
import {
  EMPTY_CHILD_FILTERS,
  filterChildDirectory,
  sortChildDirectory,
  type ChildDirectoryFilters,
  type ChildDirectoryRow,
  type ChildSortKey,
  type SortDirection,
} from '@/domain/childDirectory'
import type { ChildProfile, TutorAccount } from '@/types'

const COLUMNS: Array<{ key: ChildSortKey; label: string }> = [
  { key: 'name', label: 'Niño' },
  { key: 'grade', label: 'Grado' },
  { key: 'age', label: 'Edad' },
  { key: 'tutor', label: 'Tutor a cargo' },
  { key: 'profile', label: 'Perfil' },
  { key: 'progress', label: 'Avance' },
  { key: 'ageBand', label: 'Etapa de edad' },
  { key: 'achievements', label: 'Logros' },
]

const selectClass = 'rounded-xl border-2 border-ink/10 bg-white px-3 py-2 text-sm font-bold'

export function ChildDirectoryTable({
  rows,
  profiles,
  tutors,
  selectedId,
  onSelect,
}: {
  rows: ChildDirectoryRow[]
  profiles: ChildProfile[]
  tutors: TutorAccount[]
  selectedId: string | null
  onSelect: (profileId: string) => void
}) {
  const [filters, setFilters] = useState<ChildDirectoryFilters>(EMPTY_CHILD_FILTERS)
  const [sortKey, setSortKey] = useState<ChildSortKey>('name')
  const [direction, setDirection] = useState<SortDirection>('asc')
  const profileById = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles])

  const visible = useMemo(
    () => sortChildDirectory(filterChildDirectory(rows, filters), sortKey, direction),
    [direction, filters, rows, sortKey],
  )

  const filtersActive =
    filters.query.trim() !== '' ||
    filters.grade !== 'all' ||
    filters.tutorId !== 'all' ||
    filters.ageBand !== 'all' ||
    filters.progress !== 'all' ||
    filters.achievements !== 'all'

  function toggleSort(key: ChildSortKey) {
    if (sortKey === key) {
      setDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setDirection('asc')
  }

  return (
    <section className="rounded-[1.75rem] bg-white/90 p-5 ring-1 ring-ink/5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Directorio de niños</h2>
          <p className="text-sm font-semibold text-ink-soft">
            {visible.length} de {rows.length} {rows.length === 1 ? 'perfil' : 'perfiles'}. Toca una columna para
            ordenar y una fila para editar.
          </p>
        </div>
        {filtersActive ? (
          <button
            type="button"
            className="rounded-xl px-3 py-2 text-sm font-bold text-teal"
            onClick={() => setFilters(EMPTY_CHILD_FILTERS)}
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <label className="block text-sm font-bold text-ink-soft sm:col-span-2 xl:col-span-3">
          Buscar
          <input
            className={`${selectClass} mt-1 w-full`}
            value={filters.query}
            placeholder="Nombre, código, tutor o grado"
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
          />
        </label>
        <label className="block text-sm font-bold text-ink-soft">
          Grado
          <select
            className={`${selectClass} mt-1 w-full`}
            value={filters.grade}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                grade: event.target.value as ChildDirectoryFilters['grade'],
              }))
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
          Etapa de edad
          <select
            className={`${selectClass} mt-1 w-full`}
            value={filters.ageBand}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                ageBand: event.target.value as ChildDirectoryFilters['ageBand'],
              }))
            }
          >
            <option value="all">Todas las etapas</option>
            <option value="early">Inicial (3–5)</option>
            <option value="primary">Básico (6–8)</option>
            <option value="upper">Avanzado (9–12)</option>
          </select>
        </label>
        <label className="block text-sm font-bold text-ink-soft">
          Avance
          <select
            className={`${selectClass} mt-1 w-full`}
            value={filters.progress}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                progress: event.target.value as ChildDirectoryFilters['progress'],
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
                achievements: event.target.value as ChildDirectoryFilters['achievements'],
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
        <table className="w-full min-w-[920px] border-separate border-spacing-0 text-left">
          <caption className="sr-only">Niños, grado, edad, tutor, perfil, avance y logros</caption>
          <thead>
            <tr>
              {COLUMNS.map((column) => {
                const active = sortKey === column.key
                return (
                  <th key={column.key} scope="col" aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'} className="border-b border-ink/10 px-3 py-2">
                    <button
                      type="button"
                      className="font-bold text-ink"
                      onClick={() => toggleSort(column.key)}
                    >
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
              visible.map((row) => {
                const profile = profileById.get(row.id)
                const selected = selectedId === row.id
                return (
                  <tr
                    key={row.id}
                    className={cn('cursor-pointer', selected ? 'bg-mint/50' : 'hover:bg-sand/60')}
                    onClick={() => onSelect(row.id)}
                  >
                    <td className="border-b border-ink/5 px-3 py-3">
                      <span className="flex items-center gap-2 font-bold">
                        {profile ? (
                          <Avatar
                            name={profile.name}
                            src={profile.avatarImage}
                            look={profile.avatarLook}
                            accent={profile.accent}
                            size="sm"
                            focus="center"
                          />
                        ) : null}
                        {row.name}
                      </span>
                    </td>
                    <td className="border-b border-ink/5 px-3 py-3 font-semibold">{row.gradeLabel}</td>
                    <td className="border-b border-ink/5 px-3 py-3 font-semibold">{row.ageLabel}</td>
                    <td className="border-b border-ink/5 px-3 py-3 font-semibold">{row.tutorName}</td>
                    <td className="border-b border-ink/5 px-3 py-3 font-bold tracking-wide">{row.profileCode}</td>
                    <td className="border-b border-ink/5 px-3 py-3 font-semibold">{formatPercent(row.progress)}</td>
                    <td className="border-b border-ink/5 px-3 py-3 font-semibold">{row.ageBandLabel}</td>
                    <td className="border-b border-ink/5 px-3 py-3 font-semibold">{row.achievements}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
