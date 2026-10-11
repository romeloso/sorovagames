import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { useApp } from '@/context/AppContext'

export function StaffLoginPage({ mode }: { mode: 'tutor' | 'superadmin' }) {
  const navigate = useNavigate()
  const { canManage, loginTutor, loginSuperadmin } = useApp()
  const [secret, setSecret] = useState('')
  const [error, setError] = useState<string | null>(null)
  const isTutor = mode === 'tutor'

  if (canManage) return <Navigate to="/panel" replace />

  return (
    <PageShell>
      <TopBar backTo="/" backLabel="Inicio" />
      <section className="mx-auto max-w-md rounded-[2rem] bg-white/90 p-6 shadow-[0_12px_30px_rgba(31,42,55,0.08)] sm:p-8">
        <h1 className="font-display text-3xl font-bold text-ink">
          {isTutor ? 'Rol tutor' : 'Rol superadministrador'}
        </h1>
        <p className="mt-2 font-semibold text-ink-soft">
          {isTutor
            ? 'Entra con el código que te dio el superadministrador. Desde aquí creas los perfiles de tus niños.'
            : 'Este acceso crea y administra las cuentas de los tutores y ve los perfiles de todos los niños.'}
        </p>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-ink-soft">
            {isTutor ? 'Código de tutor' : 'PIN de superadministrador'}
          </span>
          <input
            type={isTutor ? 'text' : 'password'}
            inputMode={isTutor ? 'text' : 'numeric'}
            value={secret}
            onChange={(event) => {
              setSecret(isTutor ? event.target.value.toUpperCase() : event.target.value)
              setError(null)
            }}
            className="w-full rounded-2xl border-2 border-ink/10 px-4 py-3 text-xl font-bold tracking-[0.2em] outline-none focus:border-teal"
            placeholder={isTutor ? 'FAMILIASOROVA' : '••••'}
            autoComplete="off"
            aria-label={isTutor ? 'Código de tutor' : 'PIN de superadministrador'}
          />
        </label>

        {error ? <p className="mt-3 font-bold text-coral">{error}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              const result = isTutor ? loginTutor(secret) : loginSuperadmin(secret)
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
