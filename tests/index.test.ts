/**
 * Main entry point tests
 *
 * Traces to: FR-DESIGN-003 (public API exports), FR-DESIGN-004 (entry stability)
 *
 * Verifies the package's main entry (`src/index.ts`) re-exports the
 * `keycap` token bundle and the `KeycapTokens` type, and that consumers
 * can rely on the documented surface without hitting an error path.
 */

import { describe, it, expect } from 'vitest'
import * as entryExports from '../src/index.js'
import { keycap, type KeycapTokens } from '../src/index.js'

describe('@phenotype/design — main entry (src/index.ts)', () => {
  // -----------------------------------------------------------------------
  // Happy path: every documented export is present and well-typed
  // -----------------------------------------------------------------------
  describe('happy path', () => {
    it('re-exports the `keycap` token object from main entry', () => {
      expect(keycap).toBeDefined()
      expect(typeof keycap).toBe('object')
      expect(keycap).not.toBeNull()
    })

    it('exposes the keycap property on the namespace import', () => {
      expect(entryExports).toHaveProperty('keycap')
    })

    it('`keycap` from main entry is identity-equal to the source module export', async () => {
      const { keycap: fromTokens } = await import('../src/tokens.js')
      expect(keycap).toBe(fromTokens)
    })

    it('preserves the full documented surface (accent / slate / dark / light / font)', () => {
      // Each top-level key documented in README.md must be present.
      const requiredKeys = [
        'accent',
        'accentHover',
        'accentActive',
        'accentDim',
        'accentContrast',
        'slate',
        'dark',
        'light',
        'font',
      ] as const

      for (const k of requiredKeys) {
        expect(keycap).toHaveProperty(k)
      }
    })

    it('exposes the KeycapTokens type (assignable to keycap)', () => {
      // Compile-time assertion: KeycapTokens is the inferred type of `keycap`.
      // If this assignment ever stops compiling, the public type surface broke.
      const typed: KeycapTokens = keycap
      expect(typed).toBe(keycap)
    })
  })

  // -----------------------------------------------------------------------
  // Error path: invariants that must hold; failures here signal a broken
  // entry contract for downstream consumers.
  // -----------------------------------------------------------------------
  describe('error path / invariants', () => {
    it('throws a clear error if a caller mistreats `keycap` as a function', () => {
      // The main entry does NOT export a default callable — it exports a
      // readonly token object. A consumer that accidentally calls it should
      // get a TypeError, not a silent undefined return.
      const maybeFn = keycap as unknown as (...args: unknown[]) => unknown
      expect(() => maybeFn()).toThrow(TypeError)
    })

    it('rejects unknown top-level token keys (shape guard)', () => {
      // If a future maintainer adds a typo or removes a key, the entry
      // contract is broken. This guard fails loudly instead of silently.
      const knownKeys = new Set([
        'accent',
        'accentHover',
        'accentActive',
        'accentDim',
        'accentContrast',
        'slate',
        'dark',
        'light',
        'font',
      ])

      const actualKeys = Object.keys(keycap)
      const unknown = actualKeys.filter((k) => !knownKeys.has(k))
      const missing = [...knownKeys].filter((k) => !actualKeys.includes(k))

      expect({ unknown, missing }).toEqual({ unknown: [], missing: [] })
    })

    it('rejects malformed hex values in any color token', () => {
      // WCAG-grade color tokens must be valid hex strings. A single
      // bad token invalidates downstream contrast calculations.
      const HEX_RE = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/
      const colors: string[] = [
        keycap.accent,
        keycap.accentHover,
        keycap.accentActive,
        keycap.accentDim,
        keycap.accentContrast,
        keycap.slate,
      ]

      for (const c of colors) {
        expect(c, `expected hex color, got ${JSON.stringify(c)}`).toMatch(HEX_RE)
      }
    })
  })
})
