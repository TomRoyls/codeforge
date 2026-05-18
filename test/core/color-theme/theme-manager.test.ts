import { describe, expect, it } from 'vitest'
import { ThemeManager } from '../../../src/core/color-theme/theme-manager.js'
import { DEFAULT_THEME_COLORS } from '../../../src/core/color-theme/types.js'
import type { ThemeColors, ThemeDefinition } from '../../../src/core/color-theme/types.js'

const manager = new ThemeManager()

const fullColors: ThemeColors = {
  error: '\x1b[31m',
  warning: '\x1b[33m',
  success: '\x1b[32m',
  info: '\x1b[36m',
  debug: '\x1b[35m',
  highlight: '\x1b[1m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
}

// ─── mergeThemes() ───

describe('ThemeManager mergeThemes', () => {
  it('returns base when no overrides provided', () => {
    const result = manager.mergeThemes(DEFAULT_THEME_COLORS, {})
    expect(result).toEqual(DEFAULT_THEME_COLORS)
  })

  it('partially overrides only specified fields', () => {
    const result = manager.mergeThemes(DEFAULT_THEME_COLORS, { error: '\x1b[38;5;197m' })
    expect(result.error).toBe('\x1b[38;5;197m')
    expect(result.warning).toBe(DEFAULT_THEME_COLORS.warning)
    expect(result.success).toBe(DEFAULT_THEME_COLORS.success)
    expect(result.reset).toBe(DEFAULT_THEME_COLORS.reset)
  })

  it('fully replaces all fields when all overrides given', () => {
    const overrides: ThemeColors = {
      error: 'E',
      warning: 'W',
      success: 'S',
      info: 'I',
      debug: 'D',
      highlight: 'H',
      dim: 'DM',
      bold: 'B',
      reset: 'R',
    }
    const result = manager.mergeThemes(DEFAULT_THEME_COLORS, overrides)
    expect(result).toEqual(overrides)
  })

  it('does not mutate the base object', () => {
    const base = { ...DEFAULT_THEME_COLORS }
    manager.mergeThemes(base, { error: 'override' })
    expect(base.error).toBe(DEFAULT_THEME_COLORS.error)
  })
})

// ─── createTheme() ───

describe('ThemeManager createTheme', () => {
  it('creates a theme with isDark defaulting to true', () => {
    const theme = manager.createTheme('test', fullColors)
    expect(theme.name).toBe('test')
    expect(theme.colors).toBe(fullColors)
    expect(theme.isDark).toBe(true)
  })

  it('creates a theme with custom isDark=false', () => {
    const theme = manager.createTheme('light', fullColors, false)
    expect(theme.isDark).toBe(false)
  })

  it('creates a theme with isDark=true explicitly', () => {
    const theme = manager.createTheme('dark', fullColors, true)
    expect(theme.isDark).toBe(true)
  })
})

// ─── validateTheme() ───

describe('ThemeManager validateTheme', () => {
  it('returns empty array for a valid theme', () => {
    const theme: ThemeDefinition = { name: 'valid', colors: fullColors, isDark: true }
    expect(manager.validateTheme(theme)).toEqual([])
  })

  it('returns error for missing name', () => {
    const theme: ThemeDefinition = { name: '', colors: fullColors, isDark: true }
    const errors = manager.validateTheme(theme)
    expect(errors).toContain('Theme name is required')
  })

  it('returns error for whitespace-only name', () => {
    const theme: ThemeDefinition = { name: '   ', colors: fullColors, isDark: true }
    const errors = manager.validateTheme(theme)
    expect(errors).toContain('Theme name is required')
  })

  it('returns errors for missing color fields', () => {
    const emptyColors = {} as ThemeColors
    const theme: ThemeDefinition = { name: 'broken', colors: emptyColors, isDark: true }
    const errors = manager.validateTheme(theme)
    expect(errors).toHaveLength(9)
    expect(errors).toContain('Missing required color field: error')
    expect(errors).toContain('Missing required color field: reset')
  })

  it('treats empty string color as missing', () => {
    const colors = { ...fullColors, error: '' }
    const theme: ThemeDefinition = { name: 'empty-error', colors, isDark: true }
    const errors = manager.validateTheme(theme)
    expect(errors).toContain('Missing required color field: error')
    expect(errors).toHaveLength(1)
  })

  it('reports multiple missing fields together', () => {
    const colors = { ...fullColors, error: '', debug: '' }
    const theme: ThemeDefinition = { name: 'multi-missing', colors, isDark: true }
    const errors = manager.validateTheme(theme)
    expect(errors).toHaveLength(2)
  })
})

// ─── resolveColor() ───

describe('ThemeManager resolveColor', () => {
  it('returns the input color code as-is', () => {
    expect(manager.resolveColor('\x1b[31m')).toBe('\x1b[31m')
  })

  it('returns plain string as-is', () => {
    expect(manager.resolveColor('#ff0000')).toBe('#ff0000')
  })

  it('returns empty string as-is', () => {
    expect(manager.resolveColor('')).toBe('')
  })
})
