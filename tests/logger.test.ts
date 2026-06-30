/**
 * Logger Tests
 *
 * Traces to: L5 (observability)
 *
 * Verifies:
 * - Logger creates properly formatted log entries
 * - Log level filtering works
 * - Child loggers inherit settings
 * - Timing helper works
 * - Custom sink integration
 */

import { describe, it, expect } from 'vitest'
import { Logger } from '../src/logger'
import type { LogEntry } from '../src/logger'

describe('Logger', () => {
  it('logs info messages', () => {
    const entries: LogEntry[] = []
    const log = new Logger('test', 'debug')
    log.setSink((e) => entries.push(e))

    log.info('hello')
    expect(entries).toHaveLength(1)
    expect(entries[0].level).toBe('info')
    expect(entries[0].message).toContain('[test] hello')
    expect(entries[0].timestamp).toBeDefined()
  })

  it('logs debug, info, warn, error messages', () => {
    const entries: LogEntry[] = []
    const log = new Logger('levels', 'debug')
    log.setSink((e) => entries.push(e))

    log.debug('d')
    log.info('i')
    log.warn('w')
    log.error('e')

    expect(entries).toHaveLength(4)
    expect(entries[0].level).toBe('debug')
    expect(entries[1].level).toBe('info')
    expect(entries[2].level).toBe('warn')
    expect(entries[3].level).toBe('error')
  })

  it('filters out messages below minLevel', () => {
    const entries: LogEntry[] = []
    const log = new Logger('filter', 'warn')
    log.setSink((e) => entries.push(e))

    log.debug('should not appear')
    log.info('should not appear')
    log.warn('should appear')
    log.error('should appear')

    expect(entries).toHaveLength(2)
    expect(entries[0].level).toBe('warn')
    expect(entries[1].level).toBe('error')
  })

  it('includes context in log entries', () => {
    const entries: LogEntry[] = []
    const log = new Logger('ctx', 'info')
    log.setSink((e) => entries.push(e))

    log.info('with data', { specId: 'abc', count: 3 })
    expect(entries[0].context).toEqual({ specId: 'abc', count: 3 })
  })

  it('child logger prefixes messages with parent name', () => {
    const entries: LogEntry[] = []
    const parent = new Logger('Parent', 'info')
    parent.setSink((e) => entries.push(e))

    const child = parent.child('Child')
    child.info('test')

    expect(entries[0].message).toContain('[Parent:Child] test')
  })

  describe('time() helper', () => {
    it('logs duration on success', async () => {
      const entries: LogEntry[] = []
      const log = new Logger('timer', 'info')
      log.setSink((e) => entries.push(e))

      const result = await log.time('op', async () => 'done')
      expect(result).toBe('done')
      expect(entries).toHaveLength(1)
      expect(entries[0].message).toContain('op — OK')
      expect(entries[0].context?.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('logs failure duration on error', async () => {
      const entries: LogEntry[] = []
      const log = new Logger('timer', 'info')
      log.setSink((e) => entries.push(e))

      await expect(
        log.time('failing-op', async () => { throw new Error('boom') }),
      ).rejects.toThrow('boom')

      expect(entries).toHaveLength(1)
      expect(entries[0].message).toContain('failing-op — FAILED')
      expect(entries[0].context?.error).toBe('boom')
    })
  })
})
