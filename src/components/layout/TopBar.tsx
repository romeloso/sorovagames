import { useNavigate } from 'react-router-dom'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/context/AppContext'

export function TopBar({
  showBackToProfiles = false,
  backTo,
  backLabel = 'Volver',
}: {
  showBackToProfiles?: boolean
  backTo?: string
  backLabel?: string
}) {
  const navigate = useNavigate()
  const { state, toggleSound, toggleTheme, clearActiveProfile } = useApp()

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        className="text-left transition hover:opacity-90"
        onClick={() => navigate('/')}
        aria-label="Sorova Games"
      >
        <BrandLogo size="sm" />
      </button>
      <div className="flex flex-wrap items-center gap-2">
        {backTo ? (
          <Button variant="secondary" size="md" className="!min-h-11" onClick={() => navigate(backTo)}>
            {backLabel}
          </Button>
        ) : null}
        {showBackToProfiles ? (
          <Button
            variant="secondary"
            size="md"
            className="!min-h-11"
            onClick={() => {
              clearActiveProfile()
              navigate('/')
            }}
          >
            Cambiar perfil
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="md"
          className="!min-h-11 bg-card/70 ring-1 ring-ink/10"
          onClick={toggleTheme}
          aria-pressed={state.theme === 'dark'}
          aria-label={state.theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {state.theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro'}
        </Button>
        <Button
          variant="ghost"
          size="md"
          className="!min-h-11 bg-card/70 ring-1 ring-ink/10"
          onClick={toggleSound}
          aria-pressed={state.soundEnabled}
          aria-label={state.soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
        >
          {state.soundEnabled ? '🔊 Sonido' : '🔇 Silencio'}
        </Button>
      </div>
    </header>
  )
}
