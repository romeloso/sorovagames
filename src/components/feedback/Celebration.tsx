import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export function useCelebration(trigger: boolean) {
  useEffect(() => {
    if (!trigger) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    void confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#ff6b6b', '#0f9b8e', '#ffd166', '#4cc9f0', '#90e0b2'],
    })
  }, [trigger])
}

export function FeedbackBanner({
  tone,
  title,
  subtitle,
}: {
  tone: 'success' | 'retry' | 'info'
  title: string
  subtitle?: string
}) {
  const tones = {
    success: 'bg-mint/80 text-navy ring-teal/30',
    retry: 'bg-sun/70 text-navy ring-sun/50',
    info: 'bg-sky/30 text-navy ring-sky/40',
  }

  return (
    <div
      className={`pointer-events-none rounded-3xl px-5 py-4 text-center ring-2 ${tones[tone]}`}
      role="status"
      aria-live="polite"
    >
      <p className="font-display text-2xl font-bold">{title}</p>
      {subtitle ? <p className="mt-1 font-semibold text-navy/80">{subtitle}</p> : null}
    </div>
  )
}
