/** Compara respuestas en español conservando tildes y eñe. */
export function answersMatch(input: string, answer: string) {
  return normalizeAnswer(input) === normalizeAnswer(answer)
}

export function normalizeAnswer(value: string) {
  return value.trim().replace(/\s+/g, ' ').normalize('NFC').toLocaleUpperCase('es')
}
