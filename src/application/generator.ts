import type {
  Composer,
  DesignError,
  DesignSpec,
  GeneratedDesign,
  Renderer,
  Result,
  Validator,
} from '../domain/types'
import type { ValidationSummary, LayoutPlan } from '../domain/types'
import { designError, toErrorEnvelope, RecoveryHints } from '../domain/errors'
import type { ErrorEnvelope } from '../domain/errors'
import { Logger } from '../logger'
import { withTimeout } from '../resilience'

export interface GeneratorDeps {
  renderer: Renderer
  composer: Composer
  validator: Validator
}

/** Default timeout (ms) for each pipeline step. */
const DEFAULT_STEP_TIMEOUT_MS = 30_000

export interface GeneratorConfig {
  /** Per-step timeout in milliseconds. */
  stepTimeoutMs: number
}

/**
 * Error thrown by `timedStep` when a step times out or throws.
 * Caught by caller to produce a user-facing ErrorEnvelope.
 */
class StepError extends Error {
  constructor(
    public readonly step: string,
    message: string,
  ) {
    super(message)
    this.name = 'StepError'
  }
}

/**
 * Orchestrates the design pipeline: validate → compose → render.
 *
 * Each step is independently timed out. On failure the method returns a
 * structured error envelope that includes a recovery hint so upstream
 * callers can show actionable feedback.
 */
export class DesignGenerator {
  private readonly log: Logger
  private readonly config: GeneratorConfig

  public constructor(
    private readonly spec: DesignSpec,
    private readonly deps: GeneratorDeps,
    config?: Partial<GeneratorConfig>,
  ) {
    this.log = new Logger('DesignGenerator', 'info')
    this.config = {
      stepTimeoutMs: config?.stepTimeoutMs ?? DEFAULT_STEP_TIMEOUT_MS,
    }
  }

  public async generate(): Promise<Result<GeneratedDesign, ErrorEnvelope>> {
    this.log.info('generate:start', { specId: this.spec.id })

    // -----------------------------------------------------------------------
    // Step 1 — Validate
    // -----------------------------------------------------------------------
    let validated: ValidationSummary
    {
      this.log.debug('validate:start', { specId: this.spec.id })
      try {
        const validation = await this.timedStep('validate', () =>
          this.deps.validator.validate(this.spec),
        )
        if (!validation.ok) {
          return { ok: false, error: this.fail(validation.error, RecoveryHints.VALIDATION_FAILED) }
        }
        validated = validation.value
      } catch (err) {
        return { ok: false, error: this.fail(this.toDesignError('validate', err), RecoveryHints.VALIDATION_FAILED) }
      }
      this.log.info('validate:complete', { specId: this.spec.id, warningCount: validated.warnings.length })
    }

    // -----------------------------------------------------------------------
    // Step 2 — Compose
    // -----------------------------------------------------------------------
    let layout: LayoutPlan
    {
      this.log.debug('compose:start', { specId: this.spec.id })
      try {
        layout = await this.timedStep('compose', () =>
          this.deps.composer.compose(this.spec),
        )
      } catch (err) {
        return { ok: false, error: this.fail(this.toDesignError('compose', err), RecoveryHints.COMPOSITION_FAILED) }
      }
      this.log.info('compose:complete', { specId: this.spec.id, sectionCount: layout.sections.length })
    }

    // -----------------------------------------------------------------------
    // Step 3 — Render
    // -----------------------------------------------------------------------
    let design: GeneratedDesign
    {
      this.log.debug('render:start', { specId: this.spec.id })
      try {
        design = await this.timedStep('render', () =>
          this.deps.renderer.render({ spec: this.spec, layout, warnings: validated.warnings }),
        )
      } catch (err) {
        return { ok: false, error: this.fail(this.toDesignError('render', err), RecoveryHints.RENDER_FAILED) }
      }
      this.log.info('render:complete', { specId: this.spec.id, format: design.format, outputId: design.id })
    }

    return { ok: true, value: design }
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  /**
   * Execute a function with a timeout guard. Returns the function's own
   * return value directly (no extra wrapping). Throws `StepError` on
   * timeout or execution error.
   */
  private async timedStep<T>(name: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await withTimeout(fn(), this.config.stepTimeoutMs, () => {
        this.log.warn(`${name}:timeout`, { specId: this.spec.id })
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      this.log.error(`${name}:failed`, { specId: this.spec.id, error: msg })
      throw new StepError(name, msg)
    }
  }

  /** Convert a caught error into a DesignError. */
  private toDesignError(name: string, err: unknown): DesignError {
    const msg = err instanceof Error ? err.message : String(err)
    return designError(
      msg.includes('Timed out') ? 'TIMEOUT' : 'STEP_FAILED',
      `${name} step failed: ${msg}`,
    )
  }

  /** Wrap a DesignError into a user-facing ErrorEnvelope and log it. */
  private fail(
    error: DesignError,
    hint: (typeof RecoveryHints)[keyof typeof RecoveryHints],
  ): ErrorEnvelope {
    const envelope = toErrorEnvelope(error, hint)
    this.log.error('generate:failed', {
      code: envelope.code,
      message: envelope.message,
      recoveryHint: envelope.recoveryHint?.message,
    })
    return envelope
  }
}
