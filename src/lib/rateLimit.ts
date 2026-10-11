/**
 * Rate limiter en memoria (sliding window) para acciones sensibles del cliente.
 * Protege PIN admin, subidas y altas masivas en el MVP local.
 */

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
  reason?: string
}

export interface RateLimitRule {
  /** Máximo de intentos en la ventana. */
  limit: number
  /** Ventana en milisegundos. */
  windowMs: number
  /** Bloqueo extra tras agotar el cupo (opcional). */
  lockoutMs?: number
}

interface Bucket {
  timestamps: number[]
  lockedUntil: number
}

const buckets = new Map<string, Bucket>()

export type RateLimitAction =
  | 'adminPin'
  | 'avatarUpload'
  | 'addChild'
  | 'addContent'
  | 'registerTutor'
  | 'saveState'

export const RATE_LIMIT_RULES: Record<RateLimitAction, RateLimitRule> = {
  adminPin: { limit: 5, windowMs: 60_000, lockoutMs: 60_000 },
  avatarUpload: { limit: 10, windowMs: 60_000, lockoutMs: 30_000 },
  addChild: { limit: 20, windowMs: 60_000 },
  addContent: { limit: 30, windowMs: 60_000 },
  registerTutor: { limit: 5, windowMs: 60_000, lockoutMs: 60_000 },
  saveState: { limit: 120, windowMs: 60_000 },
}

function getBucket(key: string): Bucket {
  let bucket = buckets.get(key)
  if (!bucket) {
    bucket = { timestamps: [], lockedUntil: 0 }
    buckets.set(key, bucket)
  }
  return bucket
}

/** Comprueba y registra un intento. */
export function consumeRateLimit(
  action: RateLimitAction,
  subject = 'local',
  now = Date.now(),
): RateLimitResult {
  const rule = RATE_LIMIT_RULES[action]
  const key = `${action}:${subject}`
  const bucket = getBucket(key)

  if (bucket.lockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: bucket.lockedUntil - now,
      reason: 'Demasiados intentos. Espera un momento.',
    }
  }

  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < rule.windowMs)

  if (bucket.timestamps.length >= rule.limit) {
    const oldest = bucket.timestamps[0] ?? now
    const retryAfterMs = Math.max(rule.windowMs - (now - oldest), rule.lockoutMs ?? 0)
    if (rule.lockoutMs) {
      bucket.lockedUntil = now + rule.lockoutMs
    }
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
      reason: 'Límite de acciones alcanzado. Intenta más tarde.',
    }
  }

  bucket.timestamps.push(now)
  return {
    allowed: true,
    remaining: Math.max(0, rule.limit - bucket.timestamps.length),
    retryAfterMs: 0,
  }
}

/** Solo consulta el estado sin consumir. */
export function peekRateLimit(
  action: RateLimitAction,
  subject = 'local',
  now = Date.now(),
): RateLimitResult {
  const rule = RATE_LIMIT_RULES[action]
  const bucket = getBucket(`${action}:${subject}`)

  if (bucket.lockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: bucket.lockedUntil - now,
      reason: 'Demasiados intentos. Espera un momento.',
    }
  }

  const active = bucket.timestamps.filter((ts) => now - ts < rule.windowMs)
  const remaining = Math.max(0, rule.limit - active.length)
  return {
    allowed: remaining > 0,
    remaining,
    retryAfterMs: remaining > 0 ? 0 : rule.windowMs,
  }
}

/** Reinicia buckets (útil en tests). */
export function resetRateLimits() {
  buckets.clear()
}
