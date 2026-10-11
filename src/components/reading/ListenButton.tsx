import { Button } from '@/components/ui/Button'
import { speakSpanish, speechSynthesisAvailable, stopSpeaking } from '@/domain/reading/speech'

export function ListenButton({ text }: { text: string }) {
  const available = speechSynthesisAvailable()

  return (
    <div className="space-y-2 text-center">
      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={() => {
          stopSpeaking()
          speakSpanish(text)
        }}
      >
        🔊 Escuchar otra vez
      </Button>
      {!available ? (
        <p className="text-sm font-semibold text-ink-soft">
          En este dispositivo no hay voz en español. Un adulto puede leer: «{text}».
        </p>
      ) : null}
    </div>
  )
}
