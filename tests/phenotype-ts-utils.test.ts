/**
 * phenotype-ts-utils smoke test
 *
 * Traces to: V9-T3-7 (adoption wave 1)
 *
 * Verifies the shared `phenotype-ts-utils` library (v0.1.0) is
 * importable from this repo's vitest environment, and exercises 7
 * of its 14 exported helpers.
 */

import { describe, it, expect } from 'vitest'
import {
  cn,
  truncate,
  formatDate,
  deepMerge,
  uniqueBy,
  groupBy,
  sleep,
} from 'phenotype-ts-utils'

describe('phenotype-ts-utils — smoke test', () => {
  it('cn drops falsy values and joins with spaces', () => {
    expect(cn('foo', false, null, undefined, '', 'bar')).toBe('foo bar')
  })

  it('truncate appends suffix when over maxLen', () => {
    expect(truncate('hello world', 8)).toBe('hello...')
    expect(truncate('short', 10)).toBe('short')
  })

  it('formatDate produces ISO YYYY-MM-DD by default', () => {
    expect(formatDate(new Date('2026-01-15T12:34:56Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('formatDate supports "us" format (MM/DD/YYYY)', () => {
    expect(formatDate(new Date('2026-01-15T00:00:00Z'), 'us')).toBe('01/15/2026')
  })

  it('deepMerge recursively merges nested objects', () => {
    const r = deepMerge(
      { a: 1, b: { c: 2, d: 3 } },
      { b: { c: 9, e: 4 } },
    )
    expect(r).toEqual({ a: 1, b: { c: 9, d: 3, e: 4 } })
  })

  it('uniqueBy dedupes while preserving order', () => {
    const items = [{ id: 1, n: 'a' }, { id: 2, n: 'b' }, { id: 1, n: 'c' }]
    expect(uniqueBy(items, (x) => x.id).map((x) => x.n)).toEqual(['a', 'b'])
  })

  it('groupBy buckets items by key extractor', () => {
    const out = groupBy([1, 2, 3, 4], (x) => (x % 2 === 0 ? 'even' : 'odd'))
    expect(out.even).toEqual([2, 4])
    expect(out.odd).toEqual([1, 3])
  })

  it('sleep waits the requested ms', async () => {
    const start = Date.now()
    await sleep(20)
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(15)
  })
})
