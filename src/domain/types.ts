export interface DesignSpec {
  id: string
  prompt: string
  constraints: string[]
  metadata: Record<string, string>
}

export interface LayoutSection {
  id: string
  kind: string
  content: string
}

export interface LayoutPlan {
  sections: LayoutSection[]
}

export interface ValidationSummary {
  warnings: string[]
}

export interface DesignError {
  code: string
  message: string
  cause?: string
}

export type Result<TValue, TError> =
  | {
      ok: true
      value: TValue
    }
  | {
      ok: false
      error: TError
    }

export interface GeneratedDesign {
  id: string
  format: 'json' | 'svg' | 'html'
  output: string
  warnings: string[]
}

export interface Validator {
  validate(spec: DesignSpec): Promise<Result<ValidationSummary, DesignError>>
}

export interface Composer {
  compose(spec: DesignSpec): Promise<LayoutPlan>
}

export interface RenderInput {
  spec: DesignSpec
  layout: LayoutPlan
  warnings: string[]
}

export interface Renderer {
  render(input: RenderInput): Promise<GeneratedDesign>
}
