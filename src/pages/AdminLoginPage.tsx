import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TutorAccessModule } from '@/components/tutor/TutorAccessModule'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { useApp } from '@/context/AppContext'

export function StaffLoginPage({ mode }: { mode: 'tutor' | 'superadmin' }) {
  const navigate = useNavigate()
  const { loginSuperadmin } = useApp()
  const [secret, setSecret] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (mode === 'tutor') {
    return (
      <PageShell>
        <TopBar backTo="/" backLabel="Inicio" />
        <TutorAccessModule />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <TopBar backTo="/" backLabel="Inicio" />
      <section className="mx-auto max-w-md rounded-[2rem] bg-white/90 p-6 shadow-[0_12px_30px_rgba(31,42,55,0.08)] sm:p-8">
        <h1 className="font-display text-3xl font-bold text-ink">Rol superadministrador</h1>
        <p className="mt-2 font-semibold text-ink-soft">
          Este acceso crea y administra las cuentas de los tutores y ve los perfiles de todos los niños.
        </p>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-ink-soft">PIN de superadministrador</span>
          <input
            type="password"
            inputMode="numeric"
            value={secret}
            onChange={(event) => {
              setSecret(event.target.value)
              setError(null)
            }}
            className="w-full rounded-2xl border-2 border-ink/10 px-4 py-3 text-xl font-bold tracking-[0.2em] outline-none focus:border-teal"
            placeholder="••••"
            autoComplete="off"
            autoFocus
            aria-label="PIN de superadministrador"
          />
        </label>

        {error ? <p className="mt-3 font-bold text-coral">{error}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              const result = loginSuperadmin(secret)
              if (!result.ok) {
                setError(result.error ?? 'No se pudo entrar.')
                return
              }
              navigate('/panel')
            }}
          >
            Entrar
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Cancelar
          </Button>
        </div>
      </section>
    </PageShell>
  )
}
