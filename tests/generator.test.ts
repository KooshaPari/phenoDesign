/**
 * DesignGenerator Tests
 *
 * Traces to: L14 (error handling), L26 (resilience)
 *
 * Verifies:
 * - Successful pipeline (validate → compose → render)
 * - Validation failure returns ErrorEnvelope with recovery hint
 * - Compose failure returns ErrorEnvelope with recovery hint
 * - Render failure returns ErrorEnvelope with recovery hint
 * - Timeout on a step returns TIMEOUT error envelope
 */

import { describe, it, expect, vi } from 'vitest'
import { DesignGenerator } from '../src/application/generator'
import type { GeneratorDeps } from '../src/application/generator'
import type {
  Validator,
  Composer,
  Renderer,
  DesignSpec,
  ValidationSummary,
  LayoutPlan,
  GeneratedDesign,
  DesignError,
} from '../src/domain/types'

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

function mockSpec(overrides?: Partial<DesignSpec>): DesignSpec {
  return {
    id: 'test-1',
    prompt: 'make a design',
    constraints: [],
    metadata: {},
    ...overrides,
  }
}

function okValidator(warnings: string[] = []): Validator {
  return {
    validate: vi.fn().mockResolvedValue({
      ok: true,
      value: { warnings } satisfies ValidationSummary,
    }),
  }
}

function okComposer(sections: number = 3): Composer {
  const sections_arr = Array.from({ length: sections }, (_, i) => ({
    id: `s${i}`,
    kind: 'text',
    content: `section ${i}`,
  }))
  return {
    compose: vi.fn().mockResolvedValue({
      sections: sections_arr,
    } satisfies LayoutPlan),
  }
}

function okRenderer(format: 'json' | 'svg' | 'html' = 'json'): Renderer {
  return {
    render: vi.fn().mockResolvedValue({
      id: 'design-1',
      format,
      output: '{"data":"ok"}',
      warnings: [],
    } satisfies GeneratedDesign),
  }
}

function failValidator(err: Partial<DesignError> = {}): Validator {
  return {
    validate: vi.fn().mockResolvedValue({
      ok: false,
      error: { code: 'VALIDATE_FAILED', message: 'bad spec', ...err },
    }),
  }
}

function failComposer(msg: string = 'layout error'): Composer {
  return {
    compose: vi.fn().mockRejectedValue(new Error(msg)),
  }
}

function failRenderer(msg: string = 'render error'): Renderer {
  return {
    render: vi.fn().mockRejectedValue(new Error(msg)),
  }
}

function deps(overrides?: Partial<GeneratorDeps>): GeneratorDeps {
  return {
    validator: okValidator(),
    composer: okComposer(),
    renderer: okRenderer(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DesignGenerator — successful pipeline', () => {
  it('returns a generated design when all steps succeed', async () => {
    const gen = new DesignGenerator(mockSpec(), deps())
    const result = await gen.generate()

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.id).toBe('design-1')
      expect(result.value.format).toBe('json')
    }
  })

  it('passes warnings from validation to renderer', async () => {
    const renderer = okRenderer()
    const gen = new DesignGenerator(mockSpec(), deps({
      validator: okValidator(['low contrast']),
      renderer,
    }))
    const result = await gen.generate()

    expect(result.ok).toBe(true)
    expect(renderer.render).toHaveBeenCalledWith(
      expect.objectContaining({
        warnings: ['low contrast'],
      }),
    )
  })
})

describe('DesignGenerator — validation failures', () => {
  it('returns ErrorEnvelope when validation fails', async () => {
    const gen = new DesignGenerator(mockSpec(), deps({
      validator: failValidator({ code: 'BAD_SPEC' }),
    }))
    const result = await gen.generate()

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('BAD_SPEC')
      expect(result.error.recoveryHint).toBeDefined()
      expect(result.error.recoveryHint!.message).toContain('validation')
    }
  })

  it('does not call compose or render when validation fails', async () => {
    const composer = okComposer()
    const renderer = okRenderer()
    const gen = new DesignGenerator(mockSpec(), deps({
      validator: failValidator(),
      composer,
      renderer,
    }))
    await gen.generate()

    expect(composer.compose).not.toHaveBeenCalled()
    expect(renderer.render).not.toHaveBeenCalled()
  })
})

describe('DesignGenerator — compose failures', () => {
  it('returns ErrorEnvelope when composition fails', async () => {
    const gen = new DesignGenerator(mockSpec(), deps({
      composer: failComposer(),
    }))
    const result = await gen.generate()

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('STEP_FAILED')
      expect(result.error.recoveryHint).toBeDefined()
    }
  })

  it('does not call render when composition fails', async () => {
    const renderer = okRenderer()
    const gen = new DesignGenerator(mockSpec(), deps({
      composer: failComposer(),
      renderer,
    }))
    await gen.generate()

    expect(renderer.render).not.toHaveBeenCalled()
  })
})

describe('DesignGenerator — render failures', () => {
  it('returns ErrorEnvelope when rendering fails', async () => {
    const gen = new DesignGenerator(mockSpec(), deps({
      renderer: failRenderer(),
    }))
    const result = await gen.generate()

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('STEP_FAILED')
      expect(result.error.recoveryHint).toBeDefined()
    }
  })
})

describe('DesignGenerator — timeouts', () => {
  it('returns TIMEOUT error envelope when a step times out', async () => {
    const slow = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 5000)),
    )

    const gen = new DesignGenerator(
      mockSpec(),
      {
        validator: { validate: slow },
        composer: okComposer(),
        renderer: okRenderer(),
      },
      { stepTimeoutMs: 5 },
    )

    const result = await gen.generate()

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('TIMEOUT')
    }
  })
})

describe('DesignGenerator — step execution errors', () => {
  it('returns STEP_FAILED when a step throws', async () => {
    const gen = new DesignGenerator(
      mockSpec(),
      {
        ...deps(),
        validator: { validate: vi.fn().mockRejectedValue(new Error('network error')) },
      },
      { stepTimeoutMs: 1000 },
    )

    const result = await gen.generate()

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('STEP_FAILED')
      expect(result.error.message).toContain('network error')
    }
  })
})
