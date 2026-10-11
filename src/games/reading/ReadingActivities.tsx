import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type {
  Activity,
  ActivityAttemptResult,
  LetterChoiceActivity,
  LetterFromImageActivity,
  ReadingPracticeActivity,
  SyllableBuildActivity,
  WordBuildActivity,
  WordQuizActivity,
  WordSelectActivity,
} from '@/types'

type Resolve = (result: Omit<ActivityAttemptResult, 'activityId' | 'attempts'>) => void

function ChoiceGrid({
  options,
  onPick,
}: {
  options: { id: string; label: string; value: string }[]
  onPick: (value: string) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {options.map((option) => (
        <Button
          key={option.id}
          variant="sunny"
          size="xl"
          className="w-full font-display text-3xl"
          onClick={() => onPick(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

function LetterChoiceView({
  activity,
  onResolved,
}: {
  activity: LetterChoiceActivity
  onResolved: Resolve
}) {
  const started = useMemo(() => Date.now(), [activity.id])

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-bold text-ink-soft">{activity.prompt}</p>
      <div className="mx-auto grid h-40 w-40 place-items-center rounded-[2rem] bg-coral/15 font-display text-8xl font-bold text-coral">
        {activity.letter}
      </div>
      <ChoiceGrid
        options={activity.options}
        onPick={(value) =>
          onResolved({
            correct: value === activity.answer,
            timeMs: Date.now() - started,
          })
        }
      />
    </div>
  )
}

function LetterFromImageView({
  activity,
  onResolved,
}: {
  activity: LetterFromImageActivity
  onResolved: Resolve
}) {
  const started = useMemo(() => Date.now(), [activity.id])

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-bold text-ink-soft">{activity.prompt}</p>
      <div className="mx-auto grid h-36 w-36 place-items-center rounded-[2rem] bg-sky/20 text-7xl">
        <span aria-hidden="true">{activity.image}</span>
      </div>
      {activity.wordHint ? (
        <p className="text-sm font-semibold text-ink-soft">Pista: {activity.wordHint}</p>
      ) : null}
      <ChoiceGrid
        options={activity.options}
        onPick={(value) =>
          onResolved({
            correct: value === activity.answer,
            timeMs: Date.now() - started,
          })
        }
      />
    </div>
  )
}

function SyllableBuildView({
  activity,
  onResolved,
}: {
  activity: SyllableBuildActivity
  onResolved: Resolve
}) {
  const started = useMemo(() => Date.now(), [activity.id])

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-bold text-ink-soft">{activity.prompt}</p>
      <div className="flex flex-wrap items-center justify-center gap-3 font-display text-4xl font-bold">
        {activity.parts.map((part, index) => (
          <span key={`${part}-${index}`} className="rounded-2xl bg-mint/50 px-4 py-2">
            {part}
          </span>
        ))}
        <span className="text-ink-soft">=</span>
        <span className="rounded-2xl bg-sun/60 px-4 py-2">?</span>
      </div>
      <ChoiceGrid
        options={activity.options}
        onPick={(value) =>
          onResolved({
            correct: value === activity.answer,
            timeMs: Date.now() - started,
          })
        }
      />
    </div>
  )
}

function WordSelectView({
  activity,
  onResolved,
}: {
  activity: WordSelectActivity
  onResolved: Resolve
}) {
  const started = useMemo(() => Date.now(), [activity.id])

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-bold text-ink-soft">{activity.prompt}</p>
      {activity.image ? (
        <div className="mx-auto grid h-28 w-28 place-items-center rounded-[2rem] bg-sand text-6xl">
          <span aria-hidden="true">{activity.image}</span>
        </div>
      ) : null}
      <p className="font-display text-5xl font-bold tracking-wide text-teal">{activity.word}</p>
      <ChoiceGrid
        options={activity.options}
        onPick={(value) =>
          onResolved({
            correct: value === activity.answer,
            timeMs: Date.now() - started,
          })
        }
      />
    </div>
  )
}

function WordBuildView({
  activity,
  onResolved,
}: {
  activity: WordBuildActivity
  onResolved: Resolve
}) {
  const started = useMemo(() => Date.now(), [activity.id])
  const [pool, setPool] = useState(() =>
    activity.scrambled.map((letter, index) => ({ id: `${letter}-${index}`, letter })),
  )
  const [built, setBuilt] = useState<{ id: string; letter: string }[]>([])

  const reset = () => {
    setPool(activity.scrambled.map((letter, index) => ({ id: `${letter}-${index}`, letter })))
    setBuilt([])
  }

  useEffect(() => {
    setPool(activity.scrambled.map((letter, index) => ({ id: `${letter}-${index}`, letter })))
    setBuilt([])
  }, [activity.id, activity.scrambled])

  const pushLetter = (item: { id: string; letter: string }) => {
    setPool((current) => current.filter((entry) => entry.id !== item.id))
    setBuilt((current) => [...current, item])
  }

  const popLetter = (item: { id: string; letter: string }) => {
    setBuilt((current) => current.filter((entry) => entry.id !== item.id))
    setPool((current) => [...current, item])
  }

  const submit = () => {
    const value = built.map((item) => item.letter).join('')
    const normalizedValue = value.normalize('NFC')
    const normalizedAnswer = activity.word.normalize('NFC')
    onResolved({
      correct: normalizedValue === normalizedAnswer,
      timeMs: Date.now() - started,
    })
    if (normalizedValue !== normalizedAnswer) {
      // keep letters for retry; optional reshuffle after wrong
    }
  }

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-bold text-ink-soft">{activity.prompt}</p>
      {activity.image ? <p className="text-6xl">{activity.image}</p> : null}
      <div className="mx-auto flex min-h-20 flex-wrap items-center justify-center gap-2 rounded-3xl bg-cream p-4 ring-1 ring-ink/10">
        {built.length === 0 ? (
          <span className="font-semibold text-ink-soft">Toca las letras para armar la palabra</span>
        ) : (
          built.map((item) => (
            <button
              key={item.id}
              type="button"
              className="rounded-2xl bg-teal px-4 py-3 font-display text-3xl font-bold text-white"
              onClick={() => popLetter(item)}
            >
              {item.letter}
            </button>
          ))
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {pool.map((item) => (
          <button
            key={item.id}
            type="button"
            className="rounded-2xl bg-sun px-4 py-3 font-display text-3xl font-bold text-navy"
            onClick={() => pushLetter(item)}
          >
            {item.letter}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="secondary" onClick={reset}>
          Reiniciar
        </Button>
        <Button onClick={submit} disabled={built.length === 0}>
          Comprobar
        </Button>
      </div>
    </div>
  )
}

function WordQuizView({
  activity,
  onResolved,
}: {
  activity: WordQuizActivity
  onResolved: Resolve
}) {
  const started = useMemo(() => Date.now(), [activity.id])
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    setPicked(null)
  }, [activity.id])

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-bold text-ink-soft">{activity.prompt}</p>
      {activity.image ? <p className="text-7xl">{activity.image}</p> : null}
      <p className="rounded-2xl bg-sand px-4 py-3 text-base font-bold text-ink">{activity.clue}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {activity.options.map((option) => {
          const isPicked = picked === option.value
          const isCorrect = option.value === activity.answer
          return (
            <Button
              key={option.id}
              variant="sunny"
              size="xl"
              className={cn(
                'w-full font-display text-2xl',
                isPicked && isCorrect && '!bg-success !text-white',
                isPicked && !isCorrect && '!bg-coral !text-white',
              )}
              onClick={() => {
                setPicked(option.value)
                window.setTimeout(() => {
                  onResolved({
                    correct: option.value === activity.answer,
                    timeMs: Date.now() - started,
                  })
                  if (option.value !== activity.answer) {
                    setPicked(null)
                  }
                }, 350)
              }}
            >
              {option.label}
            </Button>
          )
        })}
      </div>
      {picked && picked !== activity.answer ? (
        <p className="font-bold text-coral">Casi... mira bien y vuelve a intentar</p>
      ) : null}
    </div>
  )
}

function ReadingPracticeView({
  activity,
  onResolved,
}: {
  activity: ReadingPracticeActivity
  onResolved: Resolve
}) {
  const started = useMemo(() => Date.now(), [activity.id])
  const [value, setValue] = useState('')
  const answer = activity.answer.toUpperCase()

  useEffect(() => {
    setValue('')
  }, [activity.id])

  if (activity.mode === 'choose') {
    return (
      <div className="space-y-6 text-center">
        <p className="text-lg font-bold text-ink-soft">{activity.prompt}</p>
        <div className="whitespace-pre-line rounded-[1.75rem] bg-sand px-5 py-6 font-display text-3xl font-bold leading-snug text-ink sm:text-4xl">
          {activity.text}
        </div>
        {activity.hint ? <p className="text-sm font-semibold text-ink-soft">{activity.hint}</p> : null}
        <ChoiceGrid
          options={activity.options ?? []}
          onPick={(picked) =>
            onResolved({
              correct: picked === activity.answer,
              timeMs: Date.now() - started,
            })
          }
        />
      </div>
    )
  }

  const normalized = value.toUpperCase()
  const feedback = answer.split('').map((char, index) => {
    const typed = normalized[index]
    if (!typed) return 'pending'
    return typed === char ? 'ok' : 'bad'
  })

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-bold text-ink-soft">{activity.prompt}</p>
      <div className="whitespace-pre-line rounded-[1.75rem] bg-teal/10 px-5 py-6 font-display text-4xl font-bold tracking-wide text-teal sm:text-5xl">
        {activity.text}
      </div>
      {activity.hint ? <p className="text-sm font-semibold text-ink-soft">Pista: {activity.hint}</p> : null}

      <label className="block text-left">
        <span className="mb-2 block text-sm font-bold text-ink-soft">Tu respuesta</span>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-2xl border-2 border-ink/10 bg-card px-4 py-4 font-display text-2xl font-bold tracking-wide text-ink outline-none focus:border-teal"
          placeholder="Escribe aquí..."
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
      </label>

      <div className="flex flex-wrap justify-center gap-1 font-display text-2xl font-bold" aria-live="polite">
        {answer.split('').map((char, index) => (
          <span
            key={`${char}-${index}`}
            className={cn(
              'min-w-6 rounded-md px-1',
              feedback[index] === 'ok' && 'bg-mint text-teal-dark',
              feedback[index] === 'bad' && 'bg-coral/20 text-coral',
              feedback[index] === 'pending' && 'bg-sand text-ink-soft',
            )}
          >
            {normalized[index] ?? '·'}
          </span>
        ))}
      </div>

      {normalized.length > 0 && normalized !== answer ? (
        <p className="font-bold text-coral">Corrección al instante: revisa las letras en rojo</p>
      ) : null}
      {normalized === answer ? (
        <p className="font-bold text-teal">¡Perfecto! Así se escribe</p>
      ) : null}

      <Button
        onClick={() =>
          onResolved({
            correct: normalized === answer,
            timeMs: Date.now() - started,
            typedChars: normalized.length,
            correctChars: feedback.filter((item) => item === 'ok').length,
          })
        }
        disabled={normalized.length === 0}
      >
        Comprobar
      </Button>
    </div>
  )
}

export function ReadingActivityView({
  activity,
  onResolved,
}: {
  activity: Activity
  onResolved: Resolve
}) {
  switch (activity.kind) {
    case 'letter_choice':
      return <LetterChoiceView activity={activity} onResolved={onResolved} />
    case 'letter_from_image':
      return <LetterFromImageView activity={activity} onResolved={onResolved} />
    case 'syllable_build':
      return <SyllableBuildView activity={activity} onResolved={onResolved} />
    case 'word_select':
      return <WordSelectView activity={activity} onResolved={onResolved} />
    case 'word_build':
      return <WordBuildView key={activity.id} activity={activity} onResolved={onResolved} />
    case 'word_quiz':
      return <WordQuizView key={activity.id} activity={activity} onResolved={onResolved} />
    case 'reading_practice':
      return <ReadingPracticeView key={activity.id} activity={activity} onResolved={onResolved} />
    default:
      return <p>Esta actividad aún no está disponible.</p>
  }
}
