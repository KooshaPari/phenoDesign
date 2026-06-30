/**
 * Resilience utilities — timeout, retry, and circuit helpers.
 *
 * Traces to: L26 (resilience)
 */

import type { DesignError, Result } from './domain/types'
import { designError } from './domain/errors'

// ---------------------------------------------------------------------------
// Timeout
// ---------------------------------------------------------------------------

/**
 * Wrap a promise so it rejects after `ms` milliseconds.
 *
 * The optional `onTimeout` callback is invoked (synchronously) when the
 * timer fires, so callers can log, abort, or clean up.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  onTimeout?: () => void,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      onTimeout?.()
      reject(new Error(`Timed out after ${ms}ms`))
    }, ms)
  })

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timer)
  })
}

// ---------------------------------------------------------------------------
// Retry
// ---------------------------------------------------------------------------

export interface RetryOptions {
  /** Maximum number of retry attempts (including the initial call). */
  maxAttempts: number
  /** Base delay in ms between retries (doubled each attempt). */
  baseDelayMs: number
  /** Optional predicate to decide which errors should be retried. */
  canRetry?: (error: unknown) => boolean
  /** Called before each retry attempt. */
  onRetry?: (attempt: number, error: unknown) => void
}

const DEFAULT_RETRY: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 100,
  canRetry: () => true,
}

/**
 * Retry an async operation with exponential backoff.
 *
 * Returns a `Result` — the value on success, or the last error after all
 * attempts are exhausted.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: Partial<RetryOptions>,
): Promise<Result<T, DesignError>> {
  const opts = { ...DEFAULT_RETRY, ...options }
  let lastError: unknown

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const value = await fn()
      return { ok: true, value }
    } catch (err) {
      lastError = err
      if (!opts.canRetry!(err) || attempt === opts.maxAttempts) {
        break
      }
      opts.onRetry?.(attempt, err)
      await sleep(opts.baseDelayMs * Math.pow(2, attempt - 1))
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError)
  return { ok: false, error: designError('RETRY_EXHAUSTED', msg) }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Promise-based sleep. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
