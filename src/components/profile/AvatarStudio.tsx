import { useState } from 'react'
import { AnimatedAvatar } from '@/components/profile/AnimatedAvatar'
import { Button } from '@/components/ui/Button'
import {
  ACCESSORIES,
  BROW_SHAPES,
  defaultAvatarLook,
  EYE_COLORS,
  EYE_SHAPES,
  FACE_SHAPES,
  GLASSES,
  HAIR_COLORS,
  HAIR_STYLES,
  MOUTH_SHAPES,
  NOSE_SHAPES,
  randomAvatarLook,
  SHIRT_COLORS,
  SKIN_TONES,
  type AvatarLook,
} from '@/domain/avatarLook'
import { cn } from '@/lib/cn'

const groups = [
  { id: 'piel', label: 'Piel' },
  { id: 'cara', label: 'Cara' },
  { id: 'ojos', label: 'Ojos' },
  { id: 'cejas', label: 'Cejas' },
  { id: 'nariz', label: 'Nariz' },
  { id: 'boca', label: 'Boca' },
  { id: 'cabello', label: 'Cabello' },
  { id: 'detalles', label: 'Detalles' },
  { id: 'ropa', label: 'Ropa' },
] as const

type GroupId = (typeof groups)[number]['id']

export function AvatarStudio({
  look,
  onSave,
}: {
  look: AvatarLook | null | undefined
  onSave: (look: AvatarLook) => void
}) {
  const [draft, setDraft] = useState<AvatarLook>(look ?? defaultAvatarLook())
  const [group, setGroup] = useState<GroupId>('piel')

  function patch(next: Partial<AvatarLook>) {
    setDraft((current) => ({ ...current, ...next }))
  }

  return (
    <div className="mt-5 rounded-[1.5rem] bg-sand/60 p-4 sm:p-5">
      <h2 className="font-display text-xl font-bold">Crea tu avatar</h2>
      <p className="mt-1 text-sm font-semibold text-ink-soft">
        Elige piel, cara, ojos, cejas, nariz, boca, cabello y ropa. Se mueve al guardar.
      </p>
      <div className="mx-auto mt-4 flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-[0_8px_20px_rgba(31,42,55,0.08)]">
        <AnimatedAvatar look={draft} title="Vista previa del avatar" />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Características">
        {groups.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={group === item.id}
            className={cn(
              'min-h-10 rounded-full px-3 text-sm font-bold',
              group === item.id ? 'bg-teal text-white' : 'bg-white text-ink',
            )}
            onClick={() => setGroup(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4" role="tabpanel">
        {group === 'piel' ? (
          <Swatches
            options={SKIN_TONES}
            selected={draft.skin}
            onSelect={(skin) => patch({ skin })}
          />
        ) : null}
        {group === 'cara' ? (
          <Choices options={FACE_SHAPES} selected={draft.face} onSelect={(face) => patch({ face })} />
        ) : null}
        {group === 'ojos' ? (
          <div className="space-y-3">
            <Choices options={EYE_SHAPES} selected={draft.eyes} onSelect={(eyes) => patch({ eyes })} />
            <Swatches
              options={EYE_COLORS}
              selected={draft.eyeColor}
              onSelect={(eyeColor) => patch({ eyeColor })}
            />
          </div>
        ) : null}
        {group === 'cejas' ? (
          <Choices options={BROW_SHAPES} selected={draft.brows} onSelect={(brows) => patch({ brows })} />
        ) : null}
        {group === 'nariz' ? (
          <Choices options={NOSE_SHAPES} selected={draft.nose} onSelect={(nose) => patch({ nose })} />
        ) : null}
        {group === 'boca' ? (
          <Choices options={MOUTH_SHAPES} selected={draft.mouth} onSelect={(mouth) => patch({ mouth })} />
        ) : null}
        {group === 'cabello' ? (
          <div className="space-y-3">
            <Choices options={HAIR_STYLES} selected={draft.hair} onSelect={(hair) => patch({ hair })} />
            <Swatches
              options={HAIR_COLORS}
              selected={draft.hairColor}
              onSelect={(hairColor) => patch({ hairColor })}
            />
          </div>
        ) : null}
        {group === 'detalles' ? (
          <div className="space-y-3">
            <div className="flex flex-wrap justify-center gap-2">
              <Toggle pressed={draft.freckles} label="Pecas" onClick={() => patch({ freckles: !draft.freckles })} />
              <Toggle pressed={draft.cheeks} label="Mejillas" onClick={() => patch({ cheeks: !draft.cheeks })} />
            </div>
            <Choices
              options={GLASSES}
              selected={draft.glasses}
              onSelect={(glasses) => patch({ glasses })}
            />
            <Choices
              options={ACCESSORIES}
              selected={draft.accessory}
              onSelect={(accessory) => patch({ accessory })}
            />
          </div>
        ) : null}
        {group === 'ropa' ? (
          <Swatches
            options={SHIRT_COLORS}
            selected={draft.shirt}
            onSelect={(shirt) => patch({ shirt })}
          />
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button type="button" className="w-full" onClick={() => onSave(draft)}>
          Guardar mi avatar
        </Button>
        <Button type="button" variant="secondary" className="w-full" onClick={() => setDraft(randomAvatarLook())}>
          Sorpréndeme
        </Button>
      </div>
    </div>
  )
}

function Choices<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: readonly { id: T; label: string }[]
  selected: T
  onSelect: (id: T) => void
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={selected === option.id}
          className={cn(
            'min-h-11 rounded-2xl px-3 text-sm font-bold',
            selected === option.id ? 'bg-teal text-white' : 'bg-white text-ink',
          )}
          onClick={() => onSelect(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Swatches<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: readonly { id: T; label: string; color: string }[]
  selected: T
  onSelect: (id: T) => void
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-label={option.label}
          aria-pressed={selected === option.id}
          className={cn(
            'h-11 w-11 rounded-full ring-2 ring-white',
            selected === option.id ? 'outline outline-2 outline-offset-2 outline-teal' : '',
          )}
          style={{ backgroundColor: option.color }}
          onClick={() => onSelect(option.id)}
        />
      ))}
    </div>
  )
}

function Toggle({ pressed, label, onClick }: { pressed: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        'min-h-11 rounded-2xl px-3 text-sm font-bold',
        pressed ? 'bg-teal text-white' : 'bg-white text-ink',
      )}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
