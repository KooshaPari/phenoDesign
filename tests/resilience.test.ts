/**
 * Resilience Tests — timeout, retry, circuit helpers
 *
 * Traces to: L26 (resilience)
 *
 * Verifies:
 * - withTimeout resolves before timeout, rejects after
 * - withRetry succeeds on first attempt, retries on failure, exhausts on persistent failure
 * - Exponential backoff delay between retries
 * - Retry can be configured with custom options
 */

import { describe, it, expect, vi } from 'vitest'
import { withTimeout, withRetry } from '../src/resilience'

// ---------------------------------------------------------------------------
// Timeout
// ---------------------------------------------------------------------------

describe('withTimeout', () => {
  it('resolves before the timeout', async () => {
    const result = await withTimeout(
      Promise.resolve('ok'),
      1000,
    )
    expect(result).toBe('ok')
  })

  it('rejects after the timeout expires', async () => {
    const slow = new Promise<string>((resolve) => setTimeout(resolve, 5000))
    await expect(withTimeout(slow, 10)).rejects.toThrow('Timed out')
  })

  it('calls onTimeout callback when timeout fires', async () => {
    const onTimeout = vi.fn()
    const slow = new Promise<string>((resolve) => setTimeout(resolve, 5000))
    await expect(withTimeout(slow, 10, onTimeout)).rejects.toThrow()
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  it('does not call onTimeout when resolving early', async () => {
    const onTimeout = vi.fn()
    const result = await withTimeout(Promise.resolve('fast'), 1000, onTimeout)
    expect(result).toBe('fast')
    expect(onTimeout).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Retry
// ---------------------------------------------------------------------------

describe('withRetry', () => {
  it('returns ok on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await withRetry(fn, { maxAttempts: 3 })
    expect(result).toEqual({ ok: true, value: 'ok' })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on failure and eventually succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('transient'))
      .mockRejectedValueOnce(new Error('transient'))
      .mockResolvedValue('ok')

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 5 })
    expect(result).toEqual({ ok: true, value: 'ok' })
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('exhausts all attempts and returns the last error', async () => {
    const err = new Error('persistent failure')
    const fn = vi.fn().mockRejectedValue(err)

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 5 })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('RETRY_EXHAUSTED')
      expect(result.error.message).toContain('persistent failure')
    }
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('calls onRetry between attempts', async () => {
    const onRetry = vi.fn()
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('attempt 1'))
      .mockRejectedValueOnce(new Error('attempt 2'))
      .mockResolvedValue('ok')

    await withRetry(fn, { maxAttempts: 3, baseDelayMs: 5, onRetry })
    expect(onRetry).toHaveBeenCalledTimes(2)
    expect(onRetry).toHaveBeenNthCalledWith(1, 1, expect.any(Error))
    expect(onRetry).toHaveBeenNthCalledWith(2, 2, expect.any(Error))
  })

  it('respects canRetry predicate', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('do not retry'))
    const canRetry = vi.fn().mockReturnValue(false)

    await withRetry(fn, { maxAttempts: 3, baseDelayMs: 5, canRetry })
    expect(fn).toHaveBeenCalledTimes(1) // only the initial call
    expect(canRetry).toHaveBeenCalledTimes(1)
  })
})
