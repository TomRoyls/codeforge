import type { ThemeColors, ThemeDefinition, ColorCode } from './types.js'

export class ThemeManager {
  mergeThemes(base: ThemeColors, overrides: Partial<ThemeColors>): ThemeColors {
    return {
      error: overrides.error ?? base.error,
      warning: overrides.warning ?? base.warning,
      success: overrides.success ?? base.success,
      info: overrides.info ?? base.info,
      debug: overrides.debug ?? base.debug,
      highlight: overrides.highlight ?? base.highlight,
      dim: overrides.dim ?? base.dim,
      bold: overrides.bold ?? base.bold,
      reset: overrides.reset ?? base.reset,
    }
  }

  createTheme(name: string, colors: ThemeColors, isDark: boolean = true): ThemeDefinition {
    return { name, colors, isDark }
  }

  validateTheme(theme: ThemeDefinition): string[] {
    const errors: string[] = []
    const requiredFields: (keyof ThemeColors)[] = [
      'error', 'warning', 'success', 'info', 'debug',
      'highlight', 'dim', 'bold', 'reset',
    ]

    if (!theme.name || theme.name.trim() === '') {
      errors.push('Theme name is required')
    }

    for (const field of requiredFields) {
      const value = theme.colors[field]
      if (value === undefined || value === null || value === '') {
        errors.push(`Missing required color field: ${field}`)
      }
    }

    return errors
  }

  resolveColor(colorCode: ColorCode): string {
    return colorCode
  }
}
