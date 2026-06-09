/**
 * Domain layer validation is pure and deterministic: no logging, no I/O, and no environment reads.
 */

import type { DesignSpec, LayoutConfig, PaletteToken } from './types'

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isPaletteRole = (value: unknown): value is PaletteToken['role'] =>
  value === undefined ||
  value === 'background' ||
  value === 'foreground' ||
  value === 'accent' ||
  value === 'muted' ||
  value === 'border'

export const validatePalette = (value: unknown): value is PaletteToken[] => {
  if (!Array.isArray(value) || value.length === 0) {
    return false
  }

  return value.every((token) => {
    if (!isRecord(token)) {
      return false
    }

    return (
      isNonEmptyString(token.name) &&
      isNonEmptyString(token.value) &&
      HEX_COLOR_PATTERN.test(token.value) &&
      isPaletteRole(token.role)
    )
  })
}

export const validateLayout = (value: unknown): value is LayoutConfig => {
  if (!isRecord(value) || !isNonEmptyString(value.mode)) {
    return false
  }

  if (value.mode === 'grid') {
    return isFiniteNumber(value.columns) && isFiniteNumber(value.rows) && isFiniteNumber(value.gap)
  }

  if (value.mode === 'flex') {
    return (
      (value.direction === 'row' || value.direction === 'column') &&
      isFiniteNumber(value.gap) &&
      (value.wrap === undefined || typeof value.wrap === 'boolean')
    )
  }

  if (value.mode === 'absolute') {
    return (
      isFiniteNumber(value.originX) &&
      isFiniteNumber(value.originY) &&
      isFiniteNumber(value.layers)
    )
  }

  return false
}

export const validateDesignSpec = (value: unknown): value is DesignSpec => {
  if (!isRecord(value)) {
    return false
  }

  const allowedTargets = new Set<DesignSpec['target']>(['web', 'mobile', 'print', 'ar'])
  const dimensions = value.dimensions

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    allowedTargets.has(value.target as DesignSpec['target']) &&
    validatePalette(value.palette) &&
    validateLayout(value.layout) &&
    isRecord(dimensions) &&
    isFiniteNumber(dimensions.width) &&
    isFiniteNumber(dimensions.height) &&
    (dimensions.depth === undefined || isFiniteNumber(dimensions.depth)) &&
    (dimensions.unit === 'px' ||
      dimensions.unit === 'rem' ||
      dimensions.unit === 'mm' ||
      dimensions.unit === 'in') &&
    (dimensions.dpi === undefined || isFiniteNumber(dimensions.dpi))
  )
}
