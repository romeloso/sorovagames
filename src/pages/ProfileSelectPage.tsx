import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LobbyIntro, shouldShowLobbyIntro } from '@/components/brand/LobbyIntro'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { APP_CONFIG } from '@/config/app'
import { useApp } from '@/context/AppContext'

export function ProfileSelectPage() {
  const navigate = useNavigate()
  const { ready, loginChild } = useApp()
  const [showIntro, setShowIntro] = useState(() => shouldShowLobbyIntro())
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!ready) {
    return (
      <PageShell>
        <p className="font-display text-2xl font-bold">Cargando {APP_CONFIG.name}...</p>
      </PageShell>
    )
  }

  if (showIntro) {
    return <LobbyIntro onDone={() => setShowIntro(false)} />
  }

  return (
    <PageShell wide>
      <TopBar />
      <section className="mx-auto mb-8 max-w-xl text-center">
        <div className="mb-4 flex justify-center">
          <img
            src={APP_CONFIG.brandImage}
            alt={`${APP_CONFIG.name} — ${APP_CONFIG.tagline}`}
            className="animate-brand-float h-auto w-full max-w-md select-none object-contain sm:max-w-lg"
            width={933}
            height={797}
            decoding="async"
          />
        </div>
        <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl text-balance">
          ¿Quién va a jugar hoy?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg font-semibold text-ink-soft">
          Escribe tu código. Es tu nombre y tu fecha: día, mes y año. Por ejemplo, SOPHIA041217.
        </p>
        <form
          className="mx-auto mt-6 max-w-md space-y-3 text-left"
          onSubmit={(event) => {
            event.preventDefault()
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
              aria-label="Código del niño"
              value={code}
              autoCapitalize="characters"
              autoComplete="off"
              onChange={(event) => {
                setCode(event.target.value.toUpperCase())
                setError(null)
              }}
              className="mt-1 w-full rounded-2xl border-2 border-ink/10 px-4 py-3 text-center font-display text-2xl font-bold tracking-wide outline-none focus:border-teal"
              placeholder="SOPHIA041217"
            />
          </label>
          {error ? <p className="font-bold text-coral">{error}</p> : null}
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
