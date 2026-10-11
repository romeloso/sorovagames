import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { APP_CONFIG } from '@/config/app'
import { useApp } from '@/context/AppContext'

export function ProfileSelectPage() {
  const navigate = useNavigate()
  const { ready, loginChild } = useApp()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!ready) {
    return (
      <PageShell>
        <p className="font-display text-2xl font-bold">Cargando {APP_CONFIG.name}...</p>
      </PageShell>
    )
  }

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
        <p className="mx-auto mt-3 max-w-xl text-lg font-semibold text-ink-soft">
          Escribe tu código. Es tu nombre y tu fecha: día, mes y año. Por ejemplo, SOPHIA041217.
        </p>
        <form
          className="mx-auto mt-6 max-w-md space-y-3 text-left"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            if (!code.trim()) {
              setError('Escribe tu código.')
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
          <label className="block text-sm font-bold text-ink-soft" htmlFor="child-access-code">
            Código del niño
            <input
              id="child-access-code"
              value={code}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              aria-required="true"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'child-code-error' : undefined}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase())
                setError(null)
              }}
              className="mt-1 w-full rounded-2xl border-2 border-ink/10 px-4 py-3 text-center font-display text-2xl font-bold tracking-wide outline-none focus:border-teal aria-invalid:border-coral"
              placeholder="SOPHIA041217"
            />
          </label>
          {error ? (
            <p id="child-code-error" role="alert" className="font-bold text-coral">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full">
            Entrar a jugar
          </Button>
        </form>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="secondary" onClick={() => navigate('/tutor')}>
          Acceso tutor
        </Button>
      </div>
    </PageShell>
  )
}
