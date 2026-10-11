/**
 * Caché en memoria con TTL y tamaño máximo (LRU simple).
 * Usado para lecciones filtradas por edad y vistas derivadas.
 */

export interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class MemoryCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>()
  private readonly maxEntries: number
  private readonly defaultTtlMs: number

  constructor(options?: { maxEntries?: number; ttlMs?: number }) {
    this.maxEntries = options?.maxEntries ?? 64
    this.defaultTtlMs = options?.ttlMs ?? 60_000
  }

  get(key: string, now = Date.now()): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (entry.expiresAt <= now) {
      this.store.delete(key)
      return undefined
    }
    // refresh LRU order
    this.store.delete(key)
    this.store.set(key, entry)
    return entry.value
  }

  set(key: string, value: T, ttlMs = this.defaultTtlMs, now = Date.now()) {
    if (this.store.has(key)) this.store.delete(key)
    this.store.set(key, { value, expiresAt: now + ttlMs })
    while (this.store.size > this.maxEntries) {
      const oldest = this.store.keys().next().value
      if (oldest === undefined) break
      this.store.delete(oldest)
    }
  }

  invalidate(prefix?: string) {
    if (!prefix) {
      this.store.clear()
      return
    }
    for (const key of [...this.store.keys()]) {
      if (key.startsWith(prefix)) this.store.delete(key)
    }
  }
}

/** Firma liviana del content bank para invalidar caché. */
export function contentBankFingerprint(bank: {
  words: { id: string }[]
  passages: { id: string }[]
  topics: { id: string }[]
  avatarLibrary: { id: string }[]
}): string {
  return [
    bank.words.length,
    bank.passages.length,
    bank.topics.length,
    bank.avatarLibrary.length,
    bank.words[0]?.id ?? '',
    bank.passages[0]?.id ?? '',
    bank.topics[0]?.id ?? '',
  ].join(':')
}
