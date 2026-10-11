/** Capa de voz. Se puede sustituir después por grabaciones o un servicio propio. */

function spanishVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((voice) => voice.lang.toLowerCase() === 'es-do') ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('es-')) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('es')) ??
    null
  )
}

export function speechSynthesisAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function stopSpeaking() {
  if (!speechSynthesisAvailable()) return
  window.speechSynthesis.cancel()
}

/** Reproduce texto en español. Devuelve false si el dispositivo no puede hablar. */
export function speakSpanish(text: string) {
  if (!speechSynthesisAvailable()) return false
  const phrase = text.trim()
  if (!phrase) return false

  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(phrase)
  utterance.lang = 'es-DO'
  utterance.rate = 0.92
  const voice = spanishVoice(synth.getVoices())
  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang
  }

  synth.speak(utterance)
  return true
}
