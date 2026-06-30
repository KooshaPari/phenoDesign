/**
 * Domain Error Tests
 *
 * Traces to: L14 (error handling & user feedback)
 *
 * Verifies:
 * - ErrorEnvelope structure and factory functions
 * - RecoveryHint pre-built constants
 * - toErrorEnvelope, designError, timeoutError factories
 */

import { describe, it, expect } from 'vitest'
import {
  designError,
  timeoutError,
  toErrorEnvelope,
  RecoveryHints,
} from '../src/domain/errors'
import type { ErrorEnvelope, RecoveryHint } from '../src/domain/errors'
import type { DesignError } from '../src/domain/types'

describe('domain errors — DesignError factory', () => {
  it('designError creates a DesignError with code and message', () => {
    const err = designError('VALIDATE_FAILED', 'validation did not pass')
    expect(err).toEqual({
      code: 'VALIDATE_FAILED',
      message: 'validation did not pass',
    })
  })

  it('designError accepts optional cause', () => {
    const err = designError('RENDER_FAILED', 'render error', 'canvas broke')
    expect(err.cause).toBe('canvas broke')
  })

  it('designError omits cause when not provided', () => {
    const err = designError('OK', 'no error')
    expect(err.cause).toBeUndefined()
  })
})

describe('domain errors — timeoutError', () => {
  it('creates a TIMEOUT error with formatted message', () => {
    const err = timeoutError('validate', 5000)
    expect(err.code).toBe('TIMEOUT')
    expect(err.message).toContain('validate')
    expect(err.message).toContain('5000')
  })
})

describe('domain errors — toErrorEnvelope', () => {
  const error: DesignError = { code: 'X', message: 'test error' }

  it('wraps a DesignError into an ErrorEnvelope', () => {
    const envelope = toErrorEnvelope(error)
    expect(envelope.code).toBe('X')
    expect(envelope.message).toBe('test error')
  })

  it('includes the recovery hint when provided', () => {
    const hint: RecoveryHint = { message: 'Try again', action: 'Retry the operation' }
    const envelope = toErrorEnvelope(error, hint)
    expect(envelope.recoveryHint).toEqual(hint)
  })

  it('omits recoveryHint when not provided', () => {
    const envelope = toErrorEnvelope(error)
    expect(envelope.recoveryHint).toBeUndefined()
  })

  it('passes through the cause field', () => {
    const err: DesignError = { code: 'X', message: 'err', cause: 'something broke' }
    const envelope = toErrorEnvelope(err)
    expect(envelope.cause).toBe('something broke')
  })
})

describe('domain errors — RecoveryHints constants', () => {
  const hints: Record<string, RecoveryHint> = RecoveryHints

  it('has all expected hint keys', () => {
    const keys = [
      'VALIDATION_FAILED',
      'COMPOSITION_FAILED',
      'RENDER_FAILED',
      'TIMEOUT',
      'UNKNOWN',
    ] as const
    for (const key of keys) {
      expect(hints[key]).toBeDefined()
      expect(typeof hints[key].message).toBe('string')
      expect(typeof hints[key].action).toBe('string')
    }
  })

  it('each hint has a non-empty message and action', () => {
    for (const [, hint] of Object.entries(hints)) {
      expect(hint.message.length).toBeGreaterThan(0)
      expect(hint.action.length).toBeGreaterThan(0)
    }
  })
})

describe('domain errors — ErrorEnvelope type contract', () => {
  it('satisfies the ErrorEnvelope interface', () => {
    const envelope: ErrorEnvelope = {
      code: 'TEST',
      message: 'test',
    }
    expect(envelope.code).toBe('TEST')
  })
})
