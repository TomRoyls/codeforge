import { describe, it, expect } from 'vitest'
import { ThemeManager } from '../../src/core/color-theme/theme-manager.js'
import { ColorTheme } from '../../src/core/color-theme/color-theme.js'
import {
  DEFAULT_THEME_COLORS,
  PRESET_THEMES,
} from '../../src/core/color-theme/types.js'
import type { ThemeColors, ThemeDefinition } from '../../src/core/color-theme/types.js'

const CUSTOM_COLORS: ThemeColors = {
  error: '\x1b[38;5;9m',
  warning: '\x1b[38;5;11m',
  success: '\x1b[38;5;10m',
  info: '\x1b[38;5;14m',
  debug: '\x1b[38;5;13m',
  highlight: '\x1b[38;5;15m',
  dim: '\x1b[38;5;8m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
}

describe('ThemeManager', () => {
  const manager = new ThemeManager()

  describe('mergeThemes', () => {
    it('should return base colors when no overrides', () => {
      const result = manager.mergeThemes(DEFAULT_THEME_COLORS, {})
      expect(result.error).toBe(DEFAULT_THEME_COLORS.error)
      expect(result.warning).toBe(DEFAULT_THEME_COLORS.warning)
      expect(result.success).toBe(DEFAULT_THEME_COLORS.success)
    })

    it('should override specific colors', () => {
      const result = manager.mergeThemes(DEFAULT_THEME_COLORS, { error: '\x1b[35m' })
      expect(result.error).toBe('\x1b[35m')
      expect(result.warning).toBe(DEFAULT_THEME_COLORS.warning)
    })

    it('should override all colors when all provided', () => {
      const result = manager.mergeThemes(DEFAULT_THEME_COLORS, CUSTOM_COLORS)
      expect(result.error).toBe(CUSTOM_COLORS.error)
      expect(result.warning).toBe(CUSTOM_COLORS.warning)
      expect(result.success).toBe(CUSTOM_COLORS.success)
      expect(result.info).toBe(CUSTOM_COLORS.info)
      expect(result.debug).toBe(CUSTOM_COLORS.debug)
      expect(result.highlight).toBe(CUSTOM_COLORS.highlight)
      expect(result.dim).toBe(CUSTOM_COLORS.dim)
      expect(result.bold).toBe(CUSTOM_COLORS.bold)
      expect(result.reset).toBe(CUSTOM_COLORS.reset)
    })

    it('should preserve base reset when not overridden', () => {
      const result = manager.mergeThemes(DEFAULT_THEME_COLORS, { error: '\x1b[35m' })
      expect(result.reset).toBe(DEFAULT_THEME_COLORS.reset)
    })

    it('should handle empty string override', () => {
      const result = manager.mergeThemes(DEFAULT_THEME_COLORS, { error: '' })
      expect(result.error).toBe('')
    })

    it('should not mutate the base object', () => {
      const baseCopy = { ...DEFAULT_THEME_COLORS }
      manager.mergeThemes(DEFAULT_THEME_COLORS, { error: '\x1b[35m' })
      expect(DEFAULT_THEME_COLORS.error).toBe(baseCopy.error)
    })
  })

  describe('createTheme', () => {
    it('should create a theme with default isDark true', () => {
      const theme = manager.createTheme('test', CUSTOM_COLORS)
      expect(theme.name).toBe('test')
      expect(theme.colors).toBe(CUSTOM_COLORS)
      expect(theme.isDark).toBe(true)
    })

    it('should create a theme with isDark false', () => {
      const theme = manager.createTheme('light', CUSTOM_COLORS, false)
      expect(theme.isDark).toBe(false)
    })

    it('should create a theme with isDark true explicitly', () => {
      const theme = manager.createTheme('dark', CUSTOM_COLORS, true)
      expect(theme.isDark).toBe(true)
    })

    it('should reference the same colors object', () => {
      const theme = manager.createTheme('ref', CUSTOM_COLORS)
      expect(theme.colors).toBe(CUSTOM_COLORS)
    })
  })

  describe('validateTheme', () => {
    it('should return no errors for valid theme', () => {
      const theme: ThemeDefinition = { name: 'valid', colors: CUSTOM_COLORS, isDark: true }
      const errors = manager.validateTheme(theme)
      expect(errors).toHaveLength(0)
    })

    it('should detect missing error color', () => {
      const colors = { ...CUSTOM_COLORS, error: '' }
      const theme: ThemeDefinition = { name: 'bad', colors, isDark: true }
      const errors = manager.validateTheme(theme)
      expect(errors).toContain('Missing required color field: error')
    })

    it('should detect missing warning color', () => {
      const colors = { ...CUSTOM_COLORS, warning: '' }
      const theme: ThemeDefinition = { name: 'bad', colors, isDark: true }
      const errors = manager.validateTheme(theme)
      expect(errors).toContain('Missing required color field: warning')
    })

    it('should detect missing success color', () => {
      const colors = { ...CUSTOM_COLORS, success: '' }
      const theme: ThemeDefinition = { name: 'bad', colors, isDark: true }
      const errors = manager.validateTheme(theme)
      expect(errors).toContain('Missing required color field: success')
    })

    it('should detect missing info color', () => {
      const colors = { ...CUSTOM_COLORS, info: '' }
      const theme: ThemeDefinition = { name: 'bad', colors, isDark: true }
      const errors = manager.validateTheme(theme)
      expect(errors).toContain('Missing required color field: info')
    })

    it('should detect missing debug color', () => {
      const colors = { ...CUSTOM_COLORS, debug: '' }
      const theme: ThemeDefinition = { name: 'bad', colors, isDark: true }
      const errors = manager.validateTheme(theme)
      expect(errors).toContain('Missing required color field: debug')
    })

    it('should detect missing highlight color', () => {
      const colors = { ...CUSTOM_COLORS, highlight: '' }
      const theme: ThemeDefinition = { name: 'bad', colors, isDark: true }
      const errors = manager.validateTheme(theme)
      expect(errors).toContain('Missing required color field: highlight')
    })

    it('should detect missing dim color', () => {
      const colors = { ...CUSTOM_COLORS, dim: '' }
      const theme: ThemeDefinition = { name: 'bad', colors, isDark: true }
      const errors = manager.validateTheme(theme)
      expect(errors).toContain('Missing required color field: dim')
    })

    it('should detect missing bold color', () => {
      const colors = { ...CUSTOM_COLORS, bold: '' }
      const theme: ThemeDefinition = { name: 'bad', colors, isDark: true }
      const errors = manager.validateTheme(theme)
      expect(errors).toContain('Missing required color field: bold')
    })

    it('should detect missing reset color', () => {
      const colors = { ...CUSTOM_COLORS, reset: '' }
      const theme: ThemeDefinition = { name: 'bad', colors, isDark: true }
      const errors = manager.validateTheme(theme)
      expect(errors).toContain('Missing required color field: reset')
    })

    it('should detect empty name', () => {
      const theme: ThemeDefinition = { name: '', colors: CUSTOM_COLORS, isDark: true }
      const errors = manager.validateTheme(theme)
      expect(errors).toContain('Theme name is required')
    })

    it('should detect whitespace-only name', () => {
      const theme: ThemeDefinition = { name: '   ', colors: CUSTOM_COLORS, isDark: true }
      const errors = manager.validateTheme(theme)
      expect(errors).toContain('Theme name is required')
    })

    it('should report multiple errors at once', () => {
      const colors = { ...CUSTOM_COLORS, error: '', warning: '', reset: '' }
      const theme: ThemeDefinition = { name: '', colors, isDark: true }
      const errors = manager.validateTheme(theme)
      expect(errors.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('resolveColor', () => {
    it('should return the ANSI code as-is', () => {
      expect(manager.resolveColor('\x1b[31m')).toBe('\x1b[31m')
    })

    it('should return empty string for empty input', () => {
      expect(manager.resolveColor('')).toBe('')
    })

    it('should return complex ANSI codes', () => {
      const code = '\x1b[38;5;197m'
      expect(manager.resolveColor(code)).toBe(code)
    })
  })
})

describe('ColorTheme', () => {
  describe('constructor defaults', () => {
    it('should load with default theme', () => {
      const ct = new ColorTheme()
      expect(ct.getTheme().name).toBe('default')
    })

    it('should load all preset themes', () => {
      const ct = new ColorTheme()
      const names = ct.listThemes()
      expect(names).toContain('default')
      expect(names).toContain('monokai')
      expect(names).toContain('solarized')
      expect(names).toContain('high-contrast')
    })

    it('should accept a custom active theme', () => {
      const ct = new ColorTheme({ activeTheme: 'monokai' })
      expect(ct.getTheme().name).toBe('monokai')
    })

    it('should fall back to default if active theme not found', () => {
      const ct = new ColorTheme({ activeTheme: 'nonexistent' })
      expect(ct.getTheme().name).toBe('default')
    })

    it('should load custom themes from config', () => {
      const custom: ThemeDefinition = { name: 'custom1', colors: CUSTOM_COLORS, isDark: true }
      const ct = new ColorTheme({ customThemes: [custom] })
      expect(ct.listThemes()).toContain('custom1')
    })
  })

  describe('setTheme', () => {
    it('should switch to existing theme', () => {
      const ct = new ColorTheme()
      ct.setTheme('monokai')
      expect(ct.getTheme().name).toBe('monokai')
    })

    it('should throw for unknown theme', () => {
      const ct = new ColorTheme()
      expect(() => ct.setTheme('unknown')).toThrow('Theme not found: unknown')
    })

    it('should switch to solarized theme', () => {
      const ct = new ColorTheme()
      ct.setTheme('solarized')
      expect(ct.getTheme().name).toBe('solarized')
    })

    it('should switch to high-contrast theme', () => {
      const ct = new ColorTheme()
      ct.setTheme('high-contrast')
      expect(ct.getTheme().name).toBe('high-contrast')
    })
  })

  describe('getTheme', () => {
    it('should return active theme when no name given', () => {
      const ct = new ColorTheme()
      expect(ct.getTheme().name).toBe('default')
    })

    it('should return named theme', () => {
      const ct = new ColorTheme()
      expect(ct.getTheme('monokai').name).toBe('monokai')
    })

    it('should throw for unknown theme name', () => {
      const ct = new ColorTheme()
      expect(() => ct.getTheme('nonexistent')).toThrow('Theme not found: nonexistent')
    })
  })

  describe('getColors', () => {
    it('should return active theme colors', () => {
      const ct = new ColorTheme()
      const colors = ct.getColors()
      expect(colors.error).toBe(DEFAULT_THEME_COLORS.error)
      expect(colors.reset).toBe(DEFAULT_THEME_COLORS.reset)
    })

    it('should return named theme colors', () => {
      const ct = new ColorTheme()
      const colors = ct.getColors('monokai')
      expect(colors).toBe(PRESET_THEMES[1]!.colors)
    })

    it('should throw for unknown theme', () => {
      const ct = new ColorTheme()
      expect(() => ct.getColors('missing')).toThrow('Theme not found: missing')
    })
  })

  describe('colorize', () => {
    it('should wrap text with error color', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('oops', 'error')
      expect(result).toBe(`\x1b[31moops\x1b[0m`)
    })

    it('should wrap text with warning color', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('careful', 'warning')
      expect(result).toBe(`\x1b[33mcareful\x1b[0m`)
    })

    it('should wrap text with success color', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('done', 'success')
      expect(result).toBe(`\x1b[32mdone\x1b[0m`)
    })

    it('should wrap text with info color', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('note', 'info')
      expect(result).toBe(`\x1b[36mnote\x1b[0m`)
    })

    it('should wrap text with debug color', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('trace', 'debug')
      expect(result).toBe(`\x1b[35mtrace\x1b[0m`)
    })

    it('should wrap text with highlight color', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('important', 'highlight')
      expect(result).toBe(`\x1b[1mimportant\x1b[0m`)
    })

    it('should wrap text with dim color', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('faded', 'dim')
      expect(result).toBe(`\x1b[2mfaded\x1b[0m`)
    })

    it('should wrap text with bold color', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('strong', 'bold')
      expect(result).toBe(`\x1b[1mstrong\x1b[0m`)
    })

    it('should handle empty text', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('', 'error')
      expect(result).toBe(`\x1b[31m\x1b[0m`)
    })

    it('should use active theme colors', () => {
      const ct = new ColorTheme()
      ct.setTheme('monokai')
      const result = ct.colorize('test', 'error')
      expect(result).toContain(PRESET_THEMES[1]!.colors.error)
    })
  })

  describe('registerTheme', () => {
    it('should register a new custom theme', () => {
      const ct = new ColorTheme()
      const theme: ThemeDefinition = { name: 'custom', colors: CUSTOM_COLORS, isDark: false }
      ct.registerTheme(theme)
      expect(ct.listThemes()).toContain('custom')
    })

    it('should allow switching to registered theme', () => {
      const ct = new ColorTheme()
      const theme: ThemeDefinition = { name: 'mine', colors: CUSTOM_COLORS, isDark: true }
      ct.registerTheme(theme)
      ct.setTheme('mine')
      expect(ct.getTheme().name).toBe('mine')
    })

    it('should overwrite existing theme with same name', () => {
      const ct = new ColorTheme()
      const theme1: ThemeDefinition = { name: 'dup', colors: CUSTOM_COLORS, isDark: true }
      const theme2: ThemeDefinition = { name: 'dup', colors: DEFAULT_THEME_COLORS, isDark: false }
      ct.registerTheme(theme1)
      ct.registerTheme(theme2)
      ct.setTheme('dup')
      expect(ct.getTheme().isDark).toBe(false)
    })
  })

  describe('listThemes', () => {
    it('should list all preset theme names', () => {
      const ct = new ColorTheme()
      const names = ct.listThemes()
      expect(names).toHaveLength(4)
    })

    it('should include custom themes in list', () => {
      const ct = new ColorTheme()
      ct.registerTheme({ name: 'extra1', colors: CUSTOM_COLORS, isDark: true })
      ct.registerTheme({ name: 'extra2', colors: CUSTOM_COLORS, isDark: false })
      const names = ct.listThemes()
      expect(names).toHaveLength(6)
      expect(names).toContain('extra1')
      expect(names).toContain('extra2')
    })
  })

  describe('removeTheme', () => {
    it('should remove a custom theme', () => {
      const ct = new ColorTheme()
      ct.registerTheme({ name: 'removable', colors: CUSTOM_COLORS, isDark: true })
      expect(ct.listThemes()).toContain('removable')
      ct.removeTheme('removable')
      expect(ct.listThemes()).not.toContain('removable')
    })

    it('should throw when removing a preset theme', () => {
      const ct = new ColorTheme()
      expect(() => ct.removeTheme('default')).toThrow('Cannot remove preset theme: default')
    })

    it('should throw when removing monokai preset', () => {
      const ct = new ColorTheme()
      expect(() => ct.removeTheme('monokai')).toThrow('Cannot remove preset theme: monokai')
    })

    it('should throw for unknown theme', () => {
      const ct = new ColorTheme()
      expect(() => ct.removeTheme('ghost')).toThrow('Theme not found: ghost')
    })

    it('should reset active theme if removed theme was active', () => {
      const ct = new ColorTheme()
      ct.registerTheme({ name: 'active-one', colors: CUSTOM_COLORS, isDark: true })
      ct.setTheme('active-one')
      ct.removeTheme('active-one')
      expect(ct.getTheme().name).toBe('default')
    })
  })

  describe('stripAnsi', () => {
    it('should remove basic ANSI codes', () => {
      const input = '\x1b[31mhello\x1b[0m'
      expect(ColorTheme.stripAnsi(input)).toBe('hello')
    })

    it('should remove 256-color ANSI codes', () => {
      const input = '\x1b[38;5;197mcolored\x1b[0m'
      expect(ColorTheme.stripAnsi(input)).toBe('colored')
    })

    it('should handle text with no ANSI codes', () => {
      const input = 'plain text'
      expect(ColorTheme.stripAnsi(input)).toBe('plain text')
    })

    it('should handle empty string', () => {
      expect(ColorTheme.stripAnsi('')).toBe('')
    })

    it('should handle nested ANSI codes', () => {
      const input = '\x1b[1m\x1b[31mbold red\x1b[0m\x1b[0m'
      expect(ColorTheme.stripAnsi(input)).toBe('bold red')
    })

    it('should handle multiple colored segments', () => {
      const input = '\x1b[31mred\x1b[0m \x1b[32mgreen\x1b[0m'
      expect(ColorTheme.stripAnsi(input)).toBe('red green')
    })

    it('should handle RGB ANSI codes', () => {
      const input = '\x1b[38;2;255;128;0morange\x1b[0m'
      expect(ColorTheme.stripAnsi(input)).toBe('orange')
    })
  })

  describe('getConfig', () => {
    it('should return default config', () => {
      const ct = new ColorTheme()
      const config = ct.getConfig()
      expect(config.activeTheme).toBe('default')
      expect(config.customThemes).toHaveLength(0)
    })

    it('should return custom active theme', () => {
      const ct = new ColorTheme({ activeTheme: 'monokai' })
      const config = ct.getConfig()
      expect(config.activeTheme).toBe('monokai')
    })

    it('should include registered custom themes', () => {
      const ct = new ColorTheme()
      const custom: ThemeDefinition = { name: 'my-theme', colors: CUSTOM_COLORS, isDark: true }
      ct.registerTheme(custom)
      const config = ct.getConfig()
      expect(config.customThemes).toHaveLength(1)
      expect(config.customThemes[0]!.name).toBe('my-theme')
    })

    it('should not include preset themes in customThemes', () => {
      const ct = new ColorTheme()
      const config = ct.getConfig()
      for (const ct2 of config.customThemes) {
        expect(PRESET_THEMES.map(t => t.name)).not.toContain(ct2.name)
      }
    })

    it('should reflect theme change in config', () => {
      const ct = new ColorTheme()
      ct.setTheme('solarized')
      expect(ct.getConfig().activeTheme).toBe('solarized')
    })
  })

  describe('preset themes loaded', () => {
    it('should have default theme with standard colors', () => {
      const ct = new ColorTheme()
      const colors = ct.getColors('default')
      expect(colors.error).toBe('\x1b[31m')
      expect(colors.success).toBe('\x1b[32m')
      expect(colors.warning).toBe('\x1b[33m')
    })

    it('should have monokai theme', () => {
      const ct = new ColorTheme()
      const theme = ct.getTheme('monokai')
      expect(theme.name).toBe('monokai')
      expect(theme.isDark).toBe(true)
    })

    it('should have solarized theme', () => {
      const ct = new ColorTheme()
      const theme = ct.getTheme('solarized')
      expect(theme.name).toBe('solarized')
      expect(theme.isDark).toBe(true)
    })

    it('should have high-contrast theme', () => {
      const ct = new ColorTheme()
      const theme = ct.getTheme('high-contrast')
      expect(theme.name).toBe('high-contrast')
      expect(theme.isDark).toBe(false)
    })
  })

  describe('switch between themes', () => {
    it('should produce different colorized output for different themes', () => {
      const ct = new ColorTheme()
      ct.setTheme('default')
      const defaultResult = ct.colorize('test', 'error')
      ct.setTheme('monokai')
      const monokaiResult = ct.colorize('test', 'error')
      expect(defaultResult).not.toBe(monokaiResult)
    })

    it('should strip to same text regardless of theme', () => {
      const ct = new ColorTheme()
      ct.setTheme('default')
      const defaultColored = ct.colorize('hello', 'success')
      ct.setTheme('monokai')
      const monokaiColored = ct.colorize('hello', 'success')
      expect(ColorTheme.stripAnsi(defaultColored)).toBe('hello')
      expect(ColorTheme.stripAnsi(monokaiColored)).toBe('hello')
    })
  })

  describe('custom theme registration', () => {
    it('should use custom theme colors for colorize', () => {
      const ct = new ColorTheme()
      const custom: ThemeDefinition = { name: 'neon', colors: CUSTOM_COLORS, isDark: true }
      ct.registerTheme(custom)
      ct.setTheme('neon')
      const result = ct.colorize('glow', 'error')
      expect(result).toBe(`\x1b[38;5;9mglow\x1b[0m`)
    })

    it('should list custom themes alongside presets', () => {
      const ct = new ColorTheme()
      ct.registerTheme({ name: 'a', colors: CUSTOM_COLORS, isDark: true })
      ct.registerTheme({ name: 'b', colors: CUSTOM_COLORS, isDark: false })
      const names = ct.listThemes()
      expect(names).toContain('default')
      expect(names).toContain('a')
      expect(names).toContain('b')
    })
  })

  describe('unknown theme throws', () => {
    it('should throw on setTheme with unknown name', () => {
      const ct = new ColorTheme()
      expect(() => ct.setTheme('does-not-exist')).toThrow()
    })

    it('should throw on getTheme with unknown name', () => {
      const ct = new ColorTheme()
      expect(() => ct.getTheme('nope')).toThrow()
    })

    it('should throw on getColors with unknown name', () => {
      const ct = new ColorTheme()
      expect(() => ct.getColors('invalid')).toThrow()
    })
  })

  describe('DEFAULT_THEME_COLORS', () => {
    it('should have all required color fields', () => {
      expect(DEFAULT_THEME_COLORS.error).toBeDefined()
      expect(DEFAULT_THEME_COLORS.warning).toBeDefined()
      expect(DEFAULT_THEME_COLORS.success).toBeDefined()
      expect(DEFAULT_THEME_COLORS.info).toBeDefined()
      expect(DEFAULT_THEME_COLORS.debug).toBeDefined()
      expect(DEFAULT_THEME_COLORS.highlight).toBeDefined()
      expect(DEFAULT_THEME_COLORS.dim).toBeDefined()
      expect(DEFAULT_THEME_COLORS.bold).toBeDefined()
      expect(DEFAULT_THEME_COLORS.reset).toBeDefined()
    })

    it('should have reset as escape sequence', () => {
      expect(DEFAULT_THEME_COLORS.reset).toBe('\x1b[0m')
    })
  })

  describe('PRESET_THEMES', () => {
    it('should have 4 preset themes', () => {
      expect(PRESET_THEMES).toHaveLength(4)
    })

    it('should have unique names for all presets', () => {
      const names = PRESET_THEMES.map(t => t.name)
      const unique = new Set(names)
      expect(unique.size).toBe(names.length)
    })
  })

  describe('edge cases', () => {
    it('should handle colorize with text containing ANSI codes', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('\x1b[32malready\x1b[0m', 'error')
      expect(result).toContain('\x1b[31m')
      expect(result).toContain('\x1b[0m')
    })

    it('should handle stripAnsi with only ANSI codes', () => {
      expect(ColorTheme.stripAnsi('\x1b[31m\x1b[0m')).toBe('')
    })

    it('should handle remove default theme fails', () => {
      const ct = new ColorTheme()
      expect(() => ct.removeTheme('default')).toThrow(/Cannot remove preset theme/)
    })

    it('should handle remove solarized preset fails', () => {
      const ct = new ColorTheme()
      expect(() => ct.removeTheme('solarized')).toThrow(/Cannot remove preset theme/)
    })

    it('should handle remove high-contrast preset fails', () => {
      const ct = new ColorTheme()
      expect(() => ct.removeTheme('high-contrast')).toThrow(/Cannot remove preset theme/)
    })

    it('should preserve other themes when removing one', () => {
      const ct = new ColorTheme()
      ct.registerTheme({ name: 'keep', colors: CUSTOM_COLORS, isDark: true })
      ct.registerTheme({ name: 'remove-me', colors: CUSTOM_COLORS, isDark: true })
      ct.removeTheme('remove-me')
      expect(ct.listThemes()).toContain('keep')
      expect(ct.listThemes()).not.toContain('remove-me')
    })

    it('should handle constructor with both active theme and custom themes', () => {
      const custom: ThemeDefinition = { name: 'my-active', colors: CUSTOM_COLORS, isDark: true }
      const ct = new ColorTheme({ activeTheme: 'my-active', customThemes: [custom] })
      expect(ct.getTheme().name).toBe('my-active')
    })

    it('should handle getConfig after multiple operations', () => {
      const ct = new ColorTheme()
      ct.registerTheme({ name: 'x', colors: CUSTOM_COLORS, isDark: true })
      ct.registerTheme({ name: 'y', colors: CUSTOM_COLORS, isDark: false })
      ct.setTheme('x')
      ct.removeTheme('y')
      const config = ct.getConfig()
      expect(config.activeTheme).toBe('x')
      expect(config.customThemes).toHaveLength(1)
      expect(config.customThemes[0]!.name).toBe('x')
    })
  })
})
