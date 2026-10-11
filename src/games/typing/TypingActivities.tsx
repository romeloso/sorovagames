import { useEffect, useMemo, useRef, useState } from 'react'
import { VirtualKeyboard } from '@/components/game/VirtualKeyboard'
import type {
  Activity,
  ActivityAttemptResult,
  HomeRowActivity,
  KeyPressActivity,
  LetterRaceActivity,
  SyllableTypeActivity,
  WordTypeActivity,
} from '@/types'

type Resolve = (result: Omit<ActivityAttemptResult, 'activityId' | 'attempts'>) => void

function normalizeKey(key: string) {
  if (key === 'Dead') return ''
  if (key.length !== 1) return ''
  return key.toUpperCase()
}

function usePhysicalKey(handler: (key: string) => void, enabled = true) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      const key = normalizeKey(event.key)
      if (!key) return
      // Evita interferir con atajos del navegador que usan modificadores.
      if (event.ctrlKey || event.metaKey || event.altKey) return
      event.preventDefault()
      handlerRef.current(key)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}

function KeyTarget({
  activity,
  onResolved,
}: {
  activity: KeyPressActivity | HomeRowActivity
  onResolved: Resolve
}) {
  const started = useMemo(() => Date.now(), [activity.id])
  const fingerHint = activity.fingerHint

  const handle = (key: string) => {
    onResolved({
      correct: key === activity.key.toUpperCase(),
      timeMs: Date.now() - started,
      typedChars: 1,
      correctChars: key === activity.key.toUpperCase() ? 1 : 0,
    })
  }

  usePhysicalKey(handle)

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-bold text-ink-soft">{activity.prompt}</p>
      <div className="mx-auto grid h-36 w-36 place-items-center rounded-[2rem] bg-teal/15 font-display text-7xl font-bold text-teal">
        {activity.key}
      </div>
      {fingerHint ? (
        <p className="inline-block rounded-2xl bg-sun/50 px-4 py-2 text-base font-bold text-navy">
          {fingerHint}
        </p>
      ) : null}
      <VirtualKeyboard highlightKey={activity.key} onKey={handle} />
    </div>
  )
}

function LetterRaceView({
  activity,
  onResolved,
}: {
  activity: LetterRaceActivity
  onResolved: Resolve
}) {
  const started = useMemo(() => Date.now(), [activity.id])
  const [index, setIndex] = useState(0)
  const [correctChars, setCorrectChars] = useState(0)
  const [typedChars, setTypedChars] = useState(0)
  const current = activity.letters[index]

  const handle = (key: string) => {
    if (!current) return
    const ok = key === current
    const nextTyped = typedChars + 1
    const nextCorrect = correctChars + (ok ? 1 : 0)
    setTypedChars(nextTyped)
    setCorrectChars(nextCorrect)

    if (!ok) {
      setIndex(0)
      setCorrectChars(0)
      setTypedChars(0)
      onResolved({
        correct: false,
        timeMs: Date.now() - started,
        typedChars: nextTyped,
        correctChars: nextCorrect,
      })
      return
    }

    if (index + 1 >= activity.letters.length) {
      onResolved({
        correct: true,
        timeMs: Date.now() - started,
        typedChars: nextTyped,
        correctChars: nextCorrect,
      })
    } else {
      setIndex((value) => value + 1)
    }
  }

  usePhysicalKey(handle)

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-bold text-ink-soft">{activity.prompt}</p>
      <div className="mx-auto grid h-36 w-36 place-items-center rounded-[2rem] bg-coral/15 font-display text-7xl font-bold text-coral">
        {current}
      </div>
      <p className="font-bold text-ink-soft">
        {index + 1} / {activity.letters.length}
      </p>
      <VirtualKeyboard highlightKey={current} onKey={handle} />
    </div>
  )
}

function TypeTargetView({
  activity,
  onResolved,
}: {
  activity: SyllableTypeActivity | WordTypeActivity
  onResolved: Resolve
}) {
  const started = useMemo(() => Date.now(), [activity.id])
  const [value, setValue] = useState('')
  const target = activity.target.toUpperCase()

  const handle = (key: string) => {
    const next = `${value}${key}`.slice(0, target.length)
    setValue(next)
    if (next.length < target.length) return

    const correct = next === target
    let correctChars = 0
    for (let i = 0; i < next.length; i += 1) {
      if (next[i] === target[i]) correctChars += 1
    }
    onResolved({
      correct,
      timeMs: Date.now() - started,
      typedChars: next.length,
      correctChars,
    })
    if (!correct) {
      setValue('')
    }
  }

  usePhysicalKey(handle)

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-bold text-ink-soft">{activity.prompt}</p>
      <div
        className={
          target.length > 8
            ? 'mx-auto max-w-md rounded-[2rem] bg-sand px-6 py-5 font-display text-2xl font-bold tracking-wide text-ink sm:text-4xl'
            : 'mx-auto max-w-md rounded-[2rem] bg-sand px-6 py-5 font-display text-4xl font-bold tracking-[0.2em] text-ink sm:text-5xl'
        }
      >
        {target}
      </div>
      <div className="mx-auto min-h-16 max-w-md rounded-[1.5rem] bg-card px-4 py-3 font-display text-3xl font-bold tracking-[0.2em] text-teal ring-2 ring-teal/30">
        {value || <span className="text-ink-soft">_</span>}
      </div>
      <VirtualKeyboard onKey={handle} highlightKey={target[value.length]} />
    </div>
  )
}

export function TypingActivityView({
  activity,
  onResolved,
}: {
  activity: Activity
  onResolved: Resolve
}) {
  switch (activity.kind) {
    case 'key_press':
      return <KeyTarget key={activity.id} activity={activity} onResolved={onResolved} />
    case 'home_row':
      return <KeyTarget key={activity.id} activity={activity} onResolved={onResolved} />
    case 'letter_race':
      return <LetterRaceView key={activity.id} activity={activity} onResolved={onResolved} />
    case 'syllable_type':
    case 'word_type':
      return <TypeTargetView key={activity.id} activity={activity} onResolved={onResolved} />
    default:
      return <p>Esta actividad aún no está disponible.</p>
  }
}
