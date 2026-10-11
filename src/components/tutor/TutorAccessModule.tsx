import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GradeSelect } from '@/components/admin/GradeSelect'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'
import type { SchoolGrade } from '@/lib/grade'

const inputClass =
  'w-full rounded-2xl border-2 border-ink/10 px-4 py-3 text-lg font-bold outline-none focus:border-teal'

type Gate = 'login' | 'register'

export function TutorAccessModule() {
  const navigate = useNavigate()
  const { isTutor, state, loginTutor, registerTutor, addChildProfile } = useApp()
  const [gate, setGate] = useState<Gate>('login')
  const [code, setCode] = useState('')
  const [tutorName, setTutorName] = useState('')
  const [issuedCode, setIssuedCode] = useState<string | null>(null)
  const [childName, setChildName] = useState('')
  const [childBirthDate, setChildBirthDate] = useState('')
  const [childGrade, setChildGrade] = useState<SchoolGrade | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const account = state.activeTutorId ? state.tutors[state.activeTutorId] : null
  const family = Object.values(state.profiles).filter((profile) => profile.tutorId === state.activeTutorId)

  if (isTutor && account) {
    return (
      <section className="mx-auto max-w-md rounded-[2rem] bg-white/90 p-6 shadow-[0_12px_30px_rgba(31,42,55,0.08)] sm:p-8">
        <h1 className="font-display text-3xl font-bold text-ink">Registrar mi familia</h1>
        <p className="mt-2 font-semibold text-ink-soft">
          {account.name}, agrega a cada niño con su nombre y su fecha. Con eso se crea el código para entrar a jugar.
        </p>
        <p className="mt-4 rounded-2xl bg-mint/60 px-4 py-3 font-bold text-ink">
          Tu código de tutor es {account.accessCode}. Guárdalo para la próxima vez.
        </p>
        {issuedCode ? (
          <p className="mt-3 text-sm font-semibold text-ink-soft">La cuenta quedó creada. Ya puedes registrar a tu familia.</p>
        ) : null}

        <div className="mt-6 space-y-3">
          <label className="block text-sm font-bold text-ink-soft">
            Nombre del niño
            <input
              className={`${inputClass} mt-1`}
              aria-label="Nombre del niño"
              value={childName}
              onChange={(event) => {
                setChildName(event.target.value)
                setError(null)
              }}
            />
          </label>
          <label className="block text-sm font-bold text-ink-soft">
            Fecha de nacimiento
            <input
              type="date"
              className={`${inputClass} mt-1`}
              aria-label="Fecha de nacimiento del niño"
              value={childBirthDate}
              onChange={(event) => {
                setChildBirthDate(event.target.value)
                setError(null)
              }}
            />
          </label>
          <GradeSelect value={childGrade} onChange={setChildGrade} />
          {error ? <p className="font-bold text-coral">{error}</p> : null}
          {message ? <p className="font-bold text-ink">{message}</p> : null}
          <Button
            onClick={() => {
              if (!childName.trim() || !childBirthDate) {
                setError('Escribe el nombre y la fecha de nacimiento.')
                return
              }
              try {
                const profile = addChildProfile({
                  name: childName,
                  birthDate: childBirthDate,
                  grade: childGrade,
                })
                setChildName('')
                setChildBirthDate('')
                setChildGrade(null)
                setMessage(
                  profile.accessCode
                    ? `${profile.name} ya puede entrar con ${profile.accessCode}.`
                    : `${profile.name} quedó en tu familia.`,
                )
                setError(null)
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : 'No se pudo registrar.')
              }
            }}
          >
            Registrar en la familia
          </Button>
        </div>

        <div className="mt-6">
          <h2 className="font-display text-xl font-bold">
            Tu familia ({family.length})
          </h2>
          {family.length === 0 ? (
            <p className="mt-2 text-sm font-semibold text-ink-soft">Todavía no hay niños en esta cuenta.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {family.map((profile) => (
                <li key={profile.id} className="rounded-2xl bg-sand/70 px-4 py-3">
                  <p className="font-bold">{profile.name}</p>
                  <p className="text-sm font-semibold text-ink-soft">
                    Código: {profile.accessCode ?? 'sin código'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6">
          <Button variant="secondary" onClick={() => navigate('/panel')}>
            Abrir mi panel
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-md rounded-[2rem] bg-white/90 p-6 shadow-[0_12px_30px_rgba(31,42,55,0.08)] sm:p-8">
      <h1 className="font-display text-3xl font-bold text-ink">Rol tutor</h1>
      <p className="mt-2 font-semibold text-ink-soft">
        Regístrate con tu nombre, entra con el código y registra a tu familia.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant={gate === 'login' ? 'primary' : 'secondary'} size="md" onClick={() => setGate('login')}>
          Entrar
        </Button>
        <Button
          variant={gate === 'register' ? 'primary' : 'secondary'}
          size="md"
          onClick={() => setGate('register')}
        >
          Registrarme
        </Button>
      </div>

      {gate === 'login' ? (
        <div className="mt-6 space-y-3">
          <label className="block text-sm font-bold text-ink-soft">
            Código de tutor
            <input
              className={`${inputClass} mt-1 tracking-[0.2em]`}
              aria-label="Código de tutor"
              value={code}
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="FAMILIASOROVA"
              onChange={(event) => {
                setCode(event.target.value.toUpperCase())
                setError(null)
              }}
            />
          </label>
          {error ? <p className="font-bold text-coral">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                const result = loginTutor(code)
                if (!result.ok) {
                  setError(result.error ?? 'No se pudo entrar.')
                  return
                }
                setError(null)
              }}
            >
              Entrar
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <label className="block text-sm font-bold text-ink-soft">
            Tu nombre
            <input
              className={`${inputClass} mt-1`}
              aria-label="Nombre del tutor"
              value={tutorName}
              placeholder="María López"
              onChange={(event) => {
                setTutorName(event.target.value)
                setError(null)
              }}
            />
          </label>
          {issuedCode ? (
            <p className="rounded-2xl bg-mint/60 px-4 py-3 font-bold text-ink">
              Tu código es {issuedCode}. Guárdalo: con él entras la próxima vez.
            </p>
          ) : null}
          {error ? <p className="font-bold text-coral">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                try {
                  const tutor = registerTutor(tutorName)
                  setIssuedCode(tutor.accessCode)
                  setError(null)
                } catch (caught) {
                  setError(caught instanceof Error ? caught.message : 'No se pudo crear la cuenta.')
                }
              }}
            >
              Crear cuenta
            </Button>
            {issuedCode ? (
              <Button
                variant="secondary"
                onClick={() => {
                  const result = loginTutor(issuedCode)
                  if (!result.ok) {
                    setError(result.error ?? 'No se pudo entrar.')
                  }
                }}
              >
                Entrar y registrar mi familia
              </Button>
            ) : null}
            <Button variant="secondary" onClick={() => navigate('/')}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
