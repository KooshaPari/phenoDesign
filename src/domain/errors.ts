/**
 * Domain error types — structured error envelopes with recovery hints.
 *
 * Traces to: L14 (error handling & user feedback)
 *
 * Provides a typed error hierarchy that includes user-facing recovery hints
 * alongside the machine-readable error code and cause chain.
 */

import type { DesignError } from './types'

// ---------------------------------------------------------------------------
// Recovery guidance
// ---------------------------------------------------------------------------

/** A human-readable hint for recovering from an error. */
export interface RecoveryHint {
  readonly message: string
  readonly action: string
}

// ---------------------------------------------------------------------------
// Error envelope
// ---------------------------------------------------------------------------

/**
 * Public-facing error envelope with structured metadata.
 *
 * Separates the internal representation (the `cause` / `original`) from the
 * user-visible message and recovery path, so callers never see raw stack
 * traces or implementation details.
 */
export interface ErrorEnvelope {
  readonly code: string
  readonly message: string
  readonly recoveryHint?: RecoveryHint
  readonly cause?: string
}

// ---------------------------------------------------------------------------
// Pre-built recovery hints
// ---------------------------------------------------------------------------

export const RecoveryHints = {
  VALIDATION_FAILED: {
    message: 'The design spec did not pass validation.',
    action: 'Review the spec constraints and try again.',
  } satisfies RecoveryHint,

  COMPOSITION_FAILED: {
    message: 'Could not compose a layout from the spec.',
    action: 'Simplify the spec or provide more explicit layout guidance.',
  } satisfies RecoveryHint,

  RENDER_FAILED: {
    message: 'Rendering the design failed unexpectedly.',
    action: 'Check the format and try again. If the problem persists, open an issue.',
  } satisfies RecoveryHint,

  TIMEOUT: {
    message: 'The operation timed out.',
    action: 'The service may be overloaded. Try again in a few moments.',
  } satisfies RecoveryHint,

  UNKNOWN: {
    message: 'An unexpected error occurred.',
    action: 'If this persists, please open an issue with details of what you were doing.',
  } satisfies RecoveryHint,
} as const

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

/** Wrap a DesignError into a public ErrorEnvelope with an optional recovery hint. */
export function toErrorEnvelope(
  error: DesignError,
  hint?: RecoveryHint,
): ErrorEnvelope {
  return {
    code: error.code,
    message: error.message,
    cause: error.cause,
    recoveryHint: hint,
  }
}

/** Create a new DesignError with the given fields. */
export function designError(
  code: string,
  message: string,
  cause?: string,
): DesignError {
  return { code, message, cause }
}

/** Create a timeout DesignError. */
export function timeoutError(operation: string, ms: number): DesignError {
  return designError(
    'TIMEOUT',
    `${operation} timed out after ${ms}ms`,
  )
}
