import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { ADMIN_CONFIG } from '@/config/profiles'
import { useApp } from '@/context/AppContext'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { isAdmin, loginAdmin } = useApp()
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (isAdmin) return <Navigate to="/admin/panel" replace />

  return (
    <PageShell>
      <TopBar backTo="/" backLabel="Inicio" />
      <section className="mx-auto max-w-md rounded-[2rem] bg-card/90 p-6 shadow-[0_12px_30px_rgba(31,42,55,0.08)] sm:p-8">
        <h1 className="font-display text-3xl font-bold text-ink">Rol {ADMIN_CONFIG.roleLabel}</h1>
        <p className="mt-2 font-semibold text-ink-soft">
          Ingresa el PIN para gestionar niños, edades, temas de estudio, avatares y material.
        </p>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-ink-soft">PIN de administrador</span>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(event) => {
              setPin(event.target.value)
              setError(null)
            }}
            className="w-full rounded-2xl border-2 border-ink/10 bg-card px-4 py-3 text-xl font-bold tracking-[0.3em] text-ink outline-none focus:border-teal"
            placeholder="••••"
            autoComplete="off"
          />
        </label>

        {error ? <p className="mt-3 font-bold text-coral">{error}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              const result = loginAdmin(pin)
              if (!result.ok) {
                setError(result.error ?? 'PIN incorrecto. Inténtalo de nuevo.')
                return
              }
              navigate('/admin/panel')
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
