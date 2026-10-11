import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { APP_CONFIG } from '@/config/app'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/cn'

type Who = 'child' | 'tutor'

export function ProfileSelectPage() {
  const navigate = useNavigate()
  const { ready, isTutor, loginChild, loginTutor } = useApp()
  const [who, setWho] = useState<Who>('child')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enterPanel, setEnterPanel] = useState(false)

  if (!ready) {
    return (
      <PageShell>
        <p className="font-display text-2xl font-bold">Cargando {APP_CONFIG.name}...</p>
      </PageShell>
    )
  }

  if (enterPanel && isTutor) return <Navigate to="/panel" replace />

  function choose(next: Who) {
    setWho(next)
    setCode('')
    setError(null)
  }

  const asTutor = who === 'tutor'

  return (
    <PageShell wide>
      <TopBar />
      <section className="mx-auto mb-8 max-w-xl text-center">
        <div className="mb-4 flex justify-center">
          <button
            type="button"
            className="transition hover:opacity-90"
            onClick={() => navigate('/superadmin')}
            aria-label="Sorova Games"
          >
            <img
              src={APP_CONFIG.brandImage}
              alt=""
              className="animate-brand-float h-auto w-full max-w-md select-none object-contain sm:max-w-lg"
              width={933}
              height={797}
              decoding="async"
            />
          </button>
        </div>
        <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl text-balance">
          ¿Quién va a jugar hoy?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg font-semibold text-ink-soft">Escribe tu código de acceso.</p>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            className={cn('text-base font-bold', asTutor ? 'text-ink-soft' : 'text-ink')}
            onClick={() => choose('child')}
          >
            Niño
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={asTutor}
            aria-label="Entrar como tutor"
            onClick={() => choose(asTutor ? 'child' : 'tutor')}
            className={cn(
              'relative h-10 w-[4.25rem] rounded-full transition',
              asTutor ? 'bg-teal' : 'bg-ink/15',
            )}
          >
            <span
              className={cn(
                'absolute top-1 left-1 h-8 w-8 rounded-full bg-white shadow transition-transform',
                asTutor && 'translate-x-7',
              )}
            />
          </button>
          <button
            type="button"
            className={cn('text-base font-bold', asTutor ? 'text-ink' : 'text-ink-soft')}
            onClick={() => choose('tutor')}
          >
            Tutor
          </button>
        </div>

        <form
          className="mx-auto mt-6 max-w-md space-y-3 text-left"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            if (!code.trim()) {
              setError(asTutor ? 'Escribe tu código de tutor.' : 'Escribe tu código.')
              return
            }
            if (asTutor) {
              const result = loginTutor(code)
              if (!result.ok) {
                setError(result.error ?? 'No se pudo entrar.')
                return
              }
              setEnterPanel(true)
              return
            }
            const result = loginChild(code)
            if (!result.ok) {
              setError(result.error ?? 'No encontramos ese código.')
              return
            }
            navigate('/dashboard')
          }}
        >
          <label className="block text-sm font-bold text-ink-soft" htmlFor="access-code">
            {asTutor ? 'Código de tutor' : 'Código del niño'}
            <input
              id="access-code"
              value={code}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              aria-required="true"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'access-code-error' : undefined}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase())
                setError(null)
              }}
              className="mt-1 w-full rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 text-center font-display text-2xl font-bold tracking-wide outline-none focus:border-teal aria-invalid:border-coral"
              placeholder={asTutor ? 'FAMILIASOROVA' : 'SOPHIA041217'}
            />
          </label>
          {error ? (
            <p id="access-code-error" role="alert" className="text-center font-bold text-coral">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full">
            {asTutor ? 'Entrar' : 'Entrar a jugar'}
          </Button>
        </form>
        {asTutor ? (
          <p className="mt-4 text-center text-sm font-semibold text-ink-soft">
            <button
              type="button"
              className="font-bold text-teal underline-offset-4 hover:underline"
              onClick={() => navigate('/tutor?cuenta=nueva')}
            >
              Crear una cuenta
            </button>
          </p>
        ) : null}
      </section>
    </PageShell>
  )
}
