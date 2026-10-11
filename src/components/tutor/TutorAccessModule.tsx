import { useState, type FormEvent } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'

const fieldClass =
  'mt-1 w-full rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 text-lg font-bold outline-none focus:border-teal aria-invalid:border-coral'

type Mode = 'login' | 'register' | 'issued'

export function TutorAccessModule() {
  const { isTutor, loginTutor, registerTutor } = useApp()
  const [params] = useSearchParams()
  const [mode, setMode] = useState<Mode>(params.get('cuenta') === 'nueva' ? 'register' : 'login')
  const [code, setCode] = useState('')
  const [tutorName, setTutorName] = useState('')
  const [issuedCode, setIssuedCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (isTutor) return <Navigate to="/panel" replace />

  function openMode(next: Mode) {
    setMode(next)
    setError(null)
  }

  function onLogin(event: FormEvent) {
    event.preventDefault()
    if (!code.trim()) {
      setError('Escribe tu código de tutor.')
      return
    }
    const result = loginTutor(code)
    if (!result.ok) setError(result.error ?? 'No se pudo entrar.')
  }

  function onRegister(event: FormEvent) {
    event.preventDefault()
    try {
      const tutor = registerTutor(tutorName)
      setIssuedCode(tutor.accessCode)
      setCode(tutor.accessCode)
      setError(null)
      setMode('issued')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo crear la cuenta.')
    }
  }

  function onEnterPanel(event: FormEvent) {
    event.preventDefault()
    if (!issuedCode) return
    const result = loginTutor(issuedCode)
    if (!result.ok) setError(result.error ?? 'No se pudo entrar.')
  }

  const title =
    mode === 'login' ? 'Entrar como tutor' : mode === 'register' ? 'Crear cuenta de tutor' : 'Cuenta creada'
  const description =
    mode === 'login'
      ? 'Escribe el código de tu cuenta. El panel es donde registras a tu familia.'
      : mode === 'register'
        ? 'Usa tu nombre. Te daremos un código para volver a entrar.'
        : 'Guárdalo. Con este código entras a tu panel.'

  return (
    <section
      className="mx-auto max-w-md rounded-[2rem] bg-white/90 p-6 shadow-[0_12px_30px_rgba(31,42,55,0.08)] sm:p-8"
      aria-labelledby="tutor-access-title"
    >
      <h1 id="tutor-access-title" className="font-display text-3xl font-bold text-ink">
        {title}
      </h1>
      <p className="mt-2 font-semibold text-ink-soft">{description}</p>

      {mode === 'login' ? (
        <form className="mt-6 space-y-4" onSubmit={onLogin} noValidate>
          <label className="block text-sm font-bold text-ink-soft" htmlFor="tutor-code">
            Código de tutor
            <input
              id="tutor-code"
              className={`${fieldClass} tracking-[0.14em]`}
              value={code}
              autoFocus
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              aria-required="true"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'tutor-access-error' : undefined}
              placeholder="FAMILIASOROVA"
              onChange={(event) => {
                setCode(event.target.value.toUpperCase())
                setError(null)
              }}
            />
          </label>
          {error ? (
            <p id="tutor-access-error" role="alert" className="font-bold text-coral">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full">
            Entrar
          </Button>
          <p className="text-center text-sm font-semibold text-ink-soft">
            <button
              type="button"
              className="font-bold text-teal underline-offset-4 hover:underline"
              onClick={() => openMode('register')}
            >
              Crear una cuenta
            </button>
          </p>
        </form>
      ) : null}

      {mode === 'register' ? (
        <form className="mt-6 space-y-4" onSubmit={onRegister} noValidate>
          <label className="block text-sm font-bold text-ink-soft" htmlFor="tutor-name">
            Tu nombre
            <input
              id="tutor-name"
              className={fieldClass}
              value={tutorName}
              autoFocus
              autoComplete="name"
              aria-required="true"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'tutor-access-error' : undefined}
              placeholder="María López"
              onChange={(event) => {
                setTutorName(event.target.value)
                setError(null)
              }}
            />
          </label>
          {error ? (
            <p id="tutor-access-error" role="alert" className="font-bold text-coral">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full">
            Crear cuenta
          </Button>
          <p className="text-center text-sm font-semibold text-ink-soft">
            <button
              type="button"
              className="font-bold text-teal underline-offset-4 hover:underline"
              onClick={() => openMode('login')}
            >
              Ya tengo un código
            </button>
          </p>
        </form>
      ) : null}

      {mode === 'issued' && issuedCode ? (
        <form className="mt-6 space-y-4" onSubmit={onEnterPanel}>
          <p className="rounded-2xl bg-mint/70 px-4 py-4 text-center">
            <span className="block text-sm font-bold text-ink-soft">Tu código</span>
            <span className="mt-1 block font-display text-2xl font-bold tracking-[0.12em] text-ink">
              {issuedCode}
            </span>
          </p>
          {error ? (
            <p id="tutor-access-error" role="alert" className="font-bold text-coral">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" autoFocus>
            Entrar a mi panel
          </Button>
          <p className="text-center text-sm font-semibold text-ink-soft">
            <button
              type="button"
              className="font-bold text-teal underline-offset-4 hover:underline"
              onClick={() => openMode('login')}
            >
              Entrar con otro código
            </button>
          </p>
        </form>
      ) : null}
    </section>
  )
}
