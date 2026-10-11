import { SCHOOL_GRADES, type SchoolGrade } from '@/lib/grade'

const inputClass = 'w-full rounded-xl border-2 border-ink/10 bg-card px-3 py-2 font-bold text-ink'

export function GradeSelect({
  value,
  onChange,
  allowEmpty = true,
  label = 'Grado escolar',
  id,
}: {
  value: SchoolGrade | null
  onChange: (grade: SchoolGrade | null) => void
  allowEmpty?: boolean
  label?: string
  id?: string
}) {
  return (
    <label className="block text-sm font-bold text-ink-soft">
      {label}
      <select
        id={id}
        className={`${inputClass} mt-1`}
        value={value == null ? '' : String(value)}
        onChange={(e) => {
          const raw = e.target.value
          onChange(raw === '' ? null : (Number(raw) as SchoolGrade))
        }}
      >
        {allowEmpty ? <option value="">Sin grado definido</option> : null}
        {SCHOOL_GRADES.map((grade) => (
          <option key={grade.id} value={grade.id}>
            {grade.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function GradeRangeInputs({
  minGrade,
  maxGrade,
  onMin,
  onMax,
}: {
  minGrade: number
  maxGrade: number
  onMin: (value: number) => void
  onMax: (value: number) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="block text-sm font-bold text-ink-soft">
        Grado mínimo
        <select
          className={`${inputClass} mt-1`}
          value={minGrade}
          onChange={(e) => onMin(Number(e.target.value))}
        >
          {SCHOOL_GRADES.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.shortLabel}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-bold text-ink-soft">
        Grado máximo
        <select
          className={`${inputClass} mt-1`}
          value={maxGrade}
          onChange={(e) => onMax(Number(e.target.value))}
        >
          {SCHOOL_GRADES.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.shortLabel}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
