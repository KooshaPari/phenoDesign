/**
 * Domain layer types are pure contracts with no runtime side effects or I/O dependencies.
 */

export type RenderTarget = 'web' | 'mobile' | 'print' | 'ar'

export type LayoutConfig =
  | {
      mode: 'grid'
      columns: number
      rows: number
      gap: number
      align?: 'start' | 'center' | 'end' | 'stretch'
    }
  | {
      mode: 'flex'
      direction: 'row' | 'column'
      gap: number
      wrap?: boolean
      justify?: 'start' | 'center' | 'end' | 'space-between'
      align?: 'start' | 'center' | 'end' | 'stretch'
    }
  | {
      mode: 'absolute'
      originX: number
      originY: number
      layers: number
    }

export type PaletteToken = {
  name: string
  value: string
  role?: 'background' | 'foreground' | 'accent' | 'muted' | 'border'
}

export type Dimensions = {
  width: number
  height: number
  depth?: number
  unit: 'px' | 'rem' | 'mm' | 'in'
  dpi?: number
}

export type DesignSpec = {
  id: string
  name: string
  description?: string
  version?: string
  target: RenderTarget
  palette: PaletteToken[]
  layout: LayoutConfig
  dimensions: Dimensions
  spacingScale?: number[]
  typography?: {
    family: string
    scale: number[]
    weight?: number
  }
  metadata?: Record<string, string | number | boolean | null>
}

