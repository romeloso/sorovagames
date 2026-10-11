import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'sunny' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'md' | 'lg' | 'xl'
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'bg-teal text-white shadow-[0_4px_0_#4f46e5] hover:translate-y-px hover:shadow-[0_3px_0_#4f46e5] active:translate-y-1 active:shadow-none',
  secondary:
    'bg-card text-ink border-2 border-ink/10 shadow-[0_4px_0_rgba(15,23,42,0.12)] hover:bg-cream',
  ghost: 'bg-transparent text-ink hover:bg-card/60',
  sunny:
    'bg-sun text-navy shadow-[0_4px_0_#f59e0b] hover:translate-y-px active:translate-y-1 active:shadow-none',
  danger:
    'bg-coral text-white shadow-[0_4px_0_#db2777] hover:translate-y-px active:translate-y-1 active:shadow-none',
}

const sizes = {
  md: 'min-h-12 px-5 text-base rounded-2xl',
  lg: 'min-h-14 px-6 text-lg rounded-2xl',
  xl: 'min-h-16 px-8 text-xl rounded-3xl',
}

export function Button({
  variant = 'primary',
  size = 'lg',
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-bold transition-transform disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
