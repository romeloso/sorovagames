import { useRef, useState } from 'react'
import { Avatar } from '@/components/profile/Avatar'
import { Button } from '@/components/ui/Button'
import { AVATAR_OPTIONS } from '@/config/avatars'
import { PROFILE_SEEDS } from '@/config/profiles'
import { fileToAvatarDataUrl } from '@/lib/image'
import { cn } from '@/lib/cn'
import type { AvatarLibraryItem, ChildProfile } from '@/types'

export function AvatarUploader({
  profile,
  onSave,
  compact = false,
  library = [],
}: {
  profile: ChildProfile
  onSave: (dataUrl: string) => void
  compact?: boolean
  library?: AvatarLibraryItem[]
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const presets = AVATAR_OPTIONS[profile.id] ?? []
  const defaultSrc =
    PROFILE_SEEDS.find((seed) => seed.id === profile.id)?.avatarImage ?? profile.avatarImage
  const currentSrc = preview ?? profile.avatarImage
  const canReset = Boolean(preview) || profile.avatarImage !== defaultSrc

  const libraryOptions = library.filter(
    (item) => !presets.some((preset) => preset.src === item.src),
  )

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      setPreview(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la imagen')
    } finally {
      setBusy(false)
    }
  }

  const renderOption = (id: string, label: string, src: string) => {
    const selected = currentSrc === src
    return (
      <button
        key={id}
        type="button"
        onClick={() => {
          setPreview(null)
          onSave(src)
        }}
        className={cn(
          'flex w-20 flex-col items-center gap-1 rounded-2xl p-1 transition',
          selected ? 'bg-teal/15 ring-2 ring-teal' : 'hover:bg-card/70',
        )}
        aria-label={`Usar ${label}`}
        aria-pressed={selected}
      >
        <span className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-white">
          <img src={src} alt={label} className="h-full w-full object-cover object-center" />
        </span>
        <span className="text-[11px] font-bold text-ink-soft">{label}</span>
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Avatar
        name={profile.name}
        src={currentSrc}
        accent={profile.accent}
        size={compact ? 'lg' : 'xl'}
        focus="center"
      />

      {presets.length > 0 ? (
        <div className="w-full">
          <p className="mb-2 text-sm font-bold text-ink-soft">Elegir foto de {profile.name}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {presets.map((option) => renderOption(option.id, option.label, option.src))}
          </div>
        </div>
      ) : null}

      {libraryOptions.length > 0 ? (
        <div className="w-full">
          <p className="mb-2 text-sm font-bold text-ink-soft">Galería central</p>
          <div className="flex max-h-44 flex-wrap justify-center gap-3 overflow-y-auto">
            {libraryOptions.map((item) => renderOption(item.id, item.label, item.src))}
          </div>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          void handleFile(file)
          event.target.value = ''
        }}
      />

      <div className="flex flex-wrap justify-center gap-2">
        <Button
          size="md"
          variant="secondary"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? 'Cargando…' : 'Subir nueva'}
        </Button>
        {preview ? (
          <Button
            size="md"
            onClick={() => {
              onSave(preview)
              setPreview(null)
            }}
          >
            Guardar foto
          </Button>
        ) : null}
        {canReset ? (
          <Button
            size="md"
            variant="ghost"
            className="bg-card/80 ring-1 ring-ink/10"
            onClick={() => {
              setPreview(null)
              onSave(defaultSrc)
            }}
          >
            Usar original
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-sm font-bold text-coral">{error}</p> : null}
      <p className="max-w-sm text-xs font-semibold text-ink-soft">
        Elige una foto de la galería o sube una nueva. PNG, JPG o WEBP.
      </p>
    </div>
  )
}
