export type ColorCode = string

export interface ThemeColors {
  error: ColorCode
  warning: ColorCode
  success: ColorCode
  info: ColorCode
  debug: ColorCode
  highlight: ColorCode
  dim: ColorCode
  bold: ColorCode
  reset: ColorCode
}

export interface ThemeDefinition {
  name: string
  colors: ThemeColors
  isDark: boolean
}

export interface ThemeConfig {
  activeTheme: string
  customThemes: ThemeDefinition[]
}

export const DEFAULT_THEME_COLORS: ThemeColors = {
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

const MONOKAI_COLORS: ThemeColors = {
  error: '\x1b[38;5;197m',
  warning: '\x1b[38;5;215m',
  success: '\x1b[38;5;148m',
  info: '\x1b[38;5;117m',
  debug: '\x1b[38;5;141m',
  highlight: '\x1b[38;5;228m',
  dim: '\x1b[38;5;245m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
}

const SOLARIZED_COLORS: ThemeColors = {
  error: '\x1b[38;5;160m',
  warning: '\x1b[38;5;136m',
  success: '\x1b[38;5;64m',
  info: '\x1b[38;5;33m',
  debug: '\x1b[38;5;61m',
  highlight: '\x1b[38;5;136m',
  dim: '\x1b[38;5;244m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
}

const HIGH_CONTRAST_COLORS: ThemeColors = {
  error: '\x1b[38;5;196m',
  warning: '\x1b[38;5;226m',
  success: '\x1b[38;5;46m',
  info: '\x1b[38;5;51m',
  debug: '\x1b[38;5;201m',
  highlight: '\x1b[38;5;231m',
  dim: '\x1b[38;5;250m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
}

export const PRESET_THEMES: ThemeDefinition[] = [
  { name: 'default', colors: DEFAULT_THEME_COLORS, isDark: true },
  { name: 'monokai', colors: MONOKAI_COLORS, isDark: true },
  { name: 'solarized', colors: SOLARIZED_COLORS, isDark: true },
  { name: 'high-contrast', colors: HIGH_CONTRAST_COLORS, isDark: false },
]
