/**
 * Structured logger — lightweight, level-based logging with context.
 *
 * Traces to: L5 (observability)
 *
 * Provides a simple structured logger with four levels (debug, info, warn,
 * error), contextual fields, timing helpers, and a single replaceable sink
 * so that downstream consumers can route logs to their preferred backend.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  readonly level: LogLevel
  readonly message: string
  readonly timestamp: string
  readonly context?: Record<string, unknown>
}

export type LogSink = (entry: LogEntry) => void

// ---------------------------------------------------------------------------
// Default sink
// ---------------------------------------------------------------------------

const LEVEL_PREFIX: Record<LogLevel, string> = {
  debug: '[D]',
  info: '[I]',
  warn: '[W]',
  error: '[E]',
}

/** Default sink that writes to console with consistent formatting. */
function defaultSink(entry: LogEntry): void {
  const prefix = `${LEVEL_PREFIX[entry.level]} ${entry.timestamp}`
  const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : ''

  switch (entry.level) {
    case 'error':
      console.error(prefix, entry.message, ctx)
      break
    case 'warn':
      console.warn(prefix, entry.message, ctx)
      break
    default:
      console.log(prefix, entry.message, ctx)
  }
}

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

export class Logger {
  private sink: LogSink = defaultSink

  constructor(
    private readonly name: string,
    private readonly minLevel: LogLevel = 'debug',
  ) {}

  /** Replace the log sink (useful for testing). */
  setSink(sink: LogSink): void {
    this.sink = sink
  }

  private getSink(): LogSink {
    return this.sink
  }

  child(name: string): Logger {
    const c = new Logger(`${this.name}:${name}`, this.minLevel)
    c.setSink(this.getSink())
    return c
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.emit('debug', message, context)
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.emit('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.emit('warn', message, context)
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.emit('error', message, context)
  }

  /**
   * Time an async operation and log the duration.
   * Returns the operation result (or re-throws its error).
   */
  async time<T>(
    label: string,
    fn: () => Promise<T>,
    level: LogLevel = 'info',
  ): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      this.emit(level, `${label} — OK`, { durationMs: Date.now() - start })
      return result
    } catch (err) {
      this.emit('error', `${label} — FAILED`, {
        durationMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      })
      throw err
    }
  }

  // -------------------------------------------------------------------------
  // Internal
  // -------------------------------------------------------------------------

  private shouldEmit(level: LogLevel): boolean {
    const order: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return order.indexOf(level) >= order.indexOf(this.minLevel)
  }

  private emit(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldEmit(level)) return

    this.sink({
      level,
      message: `[${this.name}] ${message}`,
      timestamp: new Date().toISOString(),
      context,
    })
  }
}
