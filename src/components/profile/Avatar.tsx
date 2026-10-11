import { AnimatedAvatar } from '@/components/profile/AnimatedAvatar'
import { cn } from '@/lib/cn'
import type { AvatarLook } from '@/domain/avatarLook'

export function Avatar({
  name,
  src,
  look,
  size = 'lg',
  className,
  accent = '#0f9b8e',
  focus = 'center',
}: {
  name: string
  src: string
  look?: AvatarLook | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  accent?: string
  /** Encuadre del rostro dentro del círculo. */
  focus?: 'center' | 'top'
}) {
  const sizes = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-28 w-28',
    xl: 'h-36 w-36',
  }

  return (
    <span
      className={cn(
        'relative inline-block overflow-hidden rounded-full bg-white ring-4 ring-white',
        sizes[size],
        className,
      )}
      style={{ boxShadow: `0 0 0 3px ${accent}55` }}
    >
      {look ? (
        <AnimatedAvatar look={look} title={`Avatar de ${name}`} />
      ) : (
        <img
          src={src}
          alt={`Avatar de ${name}`}
          className={cn(
            'h-full w-full scale-[1.08] object-cover',
            focus === 'center' ? 'object-center' : 'object-top',
          )}
          draggable={false}
        />
      )}
    </span>
  )
}
