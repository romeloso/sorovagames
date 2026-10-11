import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'

const inputClass =
  'w-full rounded-2xl border-2 border-ink/10 px-4 py-3 text-lg font-bold outline-none focus:border-teal'

type Gate = 'login' | 'register'

export function TutorAccessModule() {
  const navigate = useNavigate()
  const { isTutor, loginTutor, registerTutor } = useApp()
  const [gate, setGate] = useState<Gate>('login')
  const [code, setCode] = useState('')
  const [tutorName, setTutorName] = useState('')
  const [issuedCode, setIssuedCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (isTutor) return <Navigate to="/panel" replace />

  return (
    <section className="mx-auto max-w-md rounded-[2rem] bg-white/90 p-6 shadow-[0_12px_30px_rgba(31,42,55,0.08)] sm:p-8">
      <h1 className="font-display text-3xl font-bold text-ink">Rol tutor</h1>
      <p className="mt-2 font-semibold text-ink-soft">
        Regístrate con tu nombre o entra con tu código. El panel es donde registras a tu familia.
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
                if (!result.ok) setError(result.error ?? 'No se pudo entrar.')
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
              Tu código es {issuedCode}. Guárdalo: con él entras a tu panel.
            </p>
          ) : null}
          {error ? <p className="font-bold text-coral">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                try {
                  const tutor = registerTutor(tutorName)
                  setIssuedCode(tutor.accessCode)
                  setCode(tutor.accessCode)
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
                  if (!result.ok) setError(result.error ?? 'No se pudo entrar.')
                }}
              >
                Entrar a mi panel
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
