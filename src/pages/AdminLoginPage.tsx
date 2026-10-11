import { useState, type FormEvent } from 'react'
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

        <form
          className="mt-6 space-y-4"
          noValidate
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            if (!secret.trim()) {
              setError('Escribe el PIN.')
              return
            }
            const result = loginSuperadmin(secret)
            if (!result.ok) {
              setError(result.error ?? 'No se pudo entrar.')
              return
            }
            navigate('/panel')
          }}
        >
          <label className="block text-sm font-bold text-ink-soft" htmlFor="superadmin-pin">
            PIN de superadministrador
            <input
              id="superadmin-pin"
              type="password"
              inputMode="numeric"
              value={secret}
              onChange={(event) => {
                setSecret(event.target.value)
                setError(null)
              }}
              className="mt-1 w-full rounded-2xl border-2 border-ink/10 px-4 py-3 text-xl font-bold tracking-[0.2em] outline-none focus:border-teal aria-invalid:border-coral"
              placeholder="••••"
              autoComplete="off"
              autoFocus
              aria-required="true"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'superadmin-pin-error' : undefined}
            />
          </label>

          {error ? (
            <p id="superadmin-pin-error" role="alert" className="font-bold text-coral">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </section>
    </PageShell>
  )
}
