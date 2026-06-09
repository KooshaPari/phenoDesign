import type {
  Composer,
  DesignError,
  DesignSpec,
  GeneratedDesign,
  Renderer,
  Result,
  Validator,
} from '../domain/types'

export interface GeneratorDeps {
  renderer: Renderer
  composer: Composer
  validator: Validator
}

export class DesignGenerator {
  private readonly logPrefix = '[DesignGenerator]'

  public constructor(
    private readonly spec: DesignSpec,
    private readonly deps: GeneratorDeps,
  ) {}

  public async generate(): Promise<Result<GeneratedDesign, DesignError>> {
    this.logStep('validate:start', { specId: this.spec.id })

    const validation = await this.deps.validator.validate(this.spec)
    if (!validation.ok) {
      const error: DesignError = {
        code: validation.error.code,
        message: validation.error.message,
        cause: validation.error.cause,
      }

      this.logStep('validate:failed', error)
      return {
        ok: false,
        error,
      }
    }

    this.logStep('validate:complete', {
      warnings: validation.value.warnings.length,
    })

    this.logStep('compose:start', { specId: this.spec.id })
    const layout = await this.deps.composer.compose(this.spec)
    this.logStep('compose:complete', {
      sectionCount: layout.sections.length,
    })

    this.logStep('render:start', { specId: this.spec.id })
    const design = await this.deps.renderer.render({
      spec: this.spec,
      layout,
      warnings: validation.value.warnings,
    })
    this.logStep('render:complete', {
      format: design.format,
      outputId: design.id,
    })

    return {
      ok: true,
      value: design,
    }
  }

  private logStep(step: string, payload: unknown): void {
    console.info(this.logPrefix, step, payload)
  }
}
