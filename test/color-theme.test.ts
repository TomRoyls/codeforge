import { ColorTheme } from '../src/core/color-theme/color-theme.js'
import { ThemeManager } from '../src/core/color-theme/theme-manager.js'
import {
  DEFAULT_THEME_COLORS,
  PRESET_THEMES,
} from '../src/core/color-theme/types.js'
import type { ThemeColors, ThemeDefinition, ThemeConfig } from '../src/core/color-theme/types.js'

// ─── ColorTheme Constructor ────────────────────────────────────────────

describe('ColorTheme', () => {
  describe('constructor', () => {
    it('initializes with default active theme when no config provided', () => {
      const ct = new ColorTheme()
      expect(ct.getTheme().name).toBe('default')
    })

    it('initializes with undefined config', () => {
      const ct = new ColorTheme(undefined)
      expect(ct.getTheme().name).toBe('default')
    })

    it('sets active theme from config.activeTheme', () => {
      const ct = new ColorTheme({ activeTheme: 'monokai' })
      expect(ct.getTheme().name).toBe('monokai')
    })

    it('falls back to default when activeTheme does not exist', () => {
      const ct = new ColorTheme({ activeTheme: 'nonexistent' })
      expect(ct.getTheme().name).toBe('default')
    })

    it('registers custom themes from config', () => {
      const custom: ThemeDefinition = {
        name: 'custom-test',
        colors: { ...DEFAULT_THEME_COLORS },
        isDark: true,
      }
      const ct = new ColorTheme({ customThemes: [custom] })
      expect(ct.listThemes()).toContain('custom-test')
    })

    it('registers custom themes and sets one as active', () => {
      const custom: ThemeDefinition = {
        name: 'my-theme',
        colors: { ...DEFAULT_THEME_COLORS },
        isDark: false,
      }
      const ct = new ColorTheme({ activeTheme: 'my-theme', customThemes: [custom] })
      expect(ct.getTheme().name).toBe('my-theme')
      expect(ct.getTheme().isDark).toBe(false)
    })

    it('custom themes override preset themes with same name', () => {
      const override: ThemeDefinition = {
        name: 'default',
        colors: { ...DEFAULT_THEME_COLORS, error: '\x1b[38;5;999m' },
        isDark: false,
      }
      const ct = new ColorTheme({ customThemes: [override] })
      expect(ct.getColors().error).toBe('\x1b[38;5;999m')
      expect(ct.getTheme().isDark).toBe(false)
    })

    it('loads all four preset themes', () => {
      const ct = new ColorTheme()
      const names = ct.listThemes()
      expect(names).toContain('default')
      expect(names).toContain('monokai')
      expect(names).toContain('solarized')
      expect(names).toContain('high-contrast')
    })
  })

  // ─── setTheme ────────────────────────────────────────────────────────

  describe('setTheme', () => {
    it('switches to an existing theme', () => {
      const ct = new ColorTheme()
      ct.setTheme('monokai')
      expect(ct.getTheme().name).toBe('monokai')
    })

    it('throws when setting a non-existent theme', () => {
      const ct = new ColorTheme()
      expect(() => ct.setTheme('nonexistent')).toThrow('Theme not found: nonexistent')
    })

    it('can switch between multiple themes', () => {
      const ct = new ColorTheme()
      ct.setTheme('monokai')
      expect(ct.getTheme().name).toBe('monokai')
      ct.setTheme('solarized')
      expect(ct.getTheme().name).toBe('solarized')
      ct.setTheme('high-contrast')
      expect(ct.getTheme().name).toBe('high-contrast')
    })
  })

  // ─── getTheme ────────────────────────────────────────────────────────

  describe('getTheme', () => {
    it('returns the active theme when called with no arguments', () => {
      const ct = new ColorTheme()
      const theme = ct.getTheme()
      expect(theme.name).toBe('default')
      expect(theme.isDark).toBe(true)
      expect(theme.colors).toBeDefined()
    })

    it('returns a specific theme by name', () => {
      const ct = new ColorTheme()
      const theme = ct.getTheme('monokai')
      expect(theme.name).toBe('monokai')
    })

    it('throws for non-existent theme name', () => {
      const ct = new ColorTheme()
      expect(() => ct.getTheme('bogus')).toThrow('Theme not found: bogus')
    })

    it('returns theme with all required color properties', () => {
      const ct = new ColorTheme()
      const colors = ct.getTheme().colors
      const keys: (keyof ThemeColors)[] = [
        'error', 'warning', 'success', 'info', 'debug',
        'highlight', 'dim', 'bold', 'reset',
      ]
      for (const key of keys) {
        expect(typeof colors[key]).toBe('string')
        expect(colors[key].length).toBeGreaterThan(0)
      }
    })
  })

  // ─── getColors ───────────────────────────────────────────────────────

  describe('getColors', () => {
    it('returns colors of the active theme', () => {
      const ct = new ColorTheme()
      const colors = ct.getColors()
      expect(colors).toEqual(DEFAULT_THEME_COLORS)
    })

    it('returns colors of a named theme', () => {
      const ct = new ColorTheme()
      const colors = ct.getColors('monokai')
      expect(colors).toBe(ct.getTheme('monokai').colors)
    })

    it('returns different colors for different themes', () => {
      const ct = new ColorTheme()
      const defaultColors = ct.getColors('default')
      const monokaiColors = ct.getColors('monokai')
      expect(defaultColors).not.toEqual(monokaiColors)
    })
  })

  // ─── colorize ────────────────────────────────────────────────────────

  describe('colorize', () => {
    it('wraps text with error color and reset', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('fail', 'error')
      const colors = ct.getColors()
      expect(result).toBe(`${colors.error}fail${colors.reset}`)
    })

    it('wraps text with success color and reset', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('ok', 'success')
      const colors = ct.getColors()
      expect(result).toBe(`${colors.success}ok${colors.reset}`)
    })

    it('wraps text with highlight color', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('bright', 'highlight')
      const colors = ct.getColors()
      expect(result).toBe(`${colors.highlight}bright${colors.reset}`)
    })

    it('wraps text with dim color', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('faded', 'dim')
      const colors = ct.getColors()
      expect(result).toBe(`${colors.dim}faded${colors.reset}`)
    })

    it('handles empty string', () => {
      const ct = new ColorTheme()
      const result = ct.colorize('', 'info')
      const colors = ct.getColors()
      expect(result).toBe(`${colors.info}${colors.reset}`)
    })

    it('works with all color keys', () => {
      const ct = new ColorTheme()
      const keys: (keyof ThemeColors)[] = [
        'error', 'warning', 'success', 'info', 'debug',
        'highlight', 'dim', 'bold', 'reset',
      ]
      const colors = ct.getColors()
      for (const key of keys) {
        const result = ct.colorize('x', key)
        expect(result).toBe(`${colors[key]}x${colors.reset}`)
      }
    })
  })

  // ─── registerTheme ──────────────────────────────────────────────────

  describe('registerTheme', () => {
    it('adds a new theme to the registry', () => {
      const ct = new ColorTheme()
      const custom: ThemeDefinition = {
        name: 'neon',
        colors: { ...DEFAULT_THEME_COLORS },
        isDark: true,
      }
      ct.registerTheme(custom)
      expect(ct.listThemes()).toContain('neon')
      expect(ct.getTheme('neon')).toEqual(custom)
    })

    it('can switch to a newly registered theme', () => {
      const ct = new ColorTheme()
      ct.registerTheme({
        name: 'ocean',
        colors: { ...DEFAULT_THEME_COLORS, info: '\x1b[34m' },
        isDark: true,
      })
      ct.setTheme('ocean')
      expect(ct.getTheme().name).toBe('ocean')
      expect(ct.getColors().info).toBe('\x1b[34m')
    })

    it('overwrites an existing custom theme', () => {
      const ct = new ColorTheme()
      ct.registerTheme({
        name: 'v1',
        colors: { ...DEFAULT_THEME_COLORS, error: '\x1b[31m' },
        isDark: true,
      })
      ct.registerTheme({
        name: 'v1',
        colors: { ...DEFAULT_THEME_COLORS, error: '\x1b[35m' },
        isDark: false,
      })
      expect(ct.getTheme('v1').isDark).toBe(false)
      expect(ct.getColors('v1').error).toBe('\x1b[35m')
    })
  })

  // ─── listThemes ─────────────────────────────────────────────────────

  describe('listThemes', () => {
    it('returns all preset theme names', () => {
      const ct = new ColorTheme()
      const names = ct.listThemes()
      expect(names).toHaveLength(4)
      expect(names).toEqual(expect.arrayContaining(['default', 'monokai', 'solarized', 'high-contrast']))
    })

    it('includes registered custom themes', () => {
      const ct = new ColorTheme()
      ct.registerTheme({
        name: 'extra',
        colors: { ...DEFAULT_THEME_COLORS },
        isDark: true,
      })
      expect(ct.listThemes()).toContain('extra')
      expect(ct.listThemes()).toHaveLength(5)
    })
  })

  // ─── removeTheme ────────────────────────────────────────────────────

  describe('removeTheme', () => {
    it('removes a custom theme', () => {
      const ct = new ColorTheme()
      ct.registerTheme({
        name: 'disposable',
        colors: { ...DEFAULT_THEME_COLORS },
        isDark: true,
      })
      expect(ct.listThemes()).toContain('disposable')
      ct.removeTheme('disposable')
      expect(ct.listThemes()).not.toContain('disposable')
    })

    it('throws when removing a preset theme', () => {
      const ct = new ColorTheme()
      expect(() => ct.removeTheme('default')).toThrow('Cannot remove preset theme: default')
      expect(() => ct.removeTheme('monokai')).toThrow('Cannot remove preset theme: monokai')
    })

    it('throws when removing a non-existent theme', () => {
      const ct = new ColorTheme()
      expect(() => ct.removeTheme('ghost')).toThrow('Theme not found: ghost')
    })

    it('falls back to default when active theme is removed', () => {
      const ct = new ColorTheme()
      ct.registerTheme({
        name: 'temporary',
        colors: { ...DEFAULT_THEME_COLORS },
        isDark: true,
      })
      ct.setTheme('temporary')
      ct.removeTheme('temporary')
      expect(ct.getTheme().name).toBe('default')
    })
  })

  // ─── stripAnsi (static) ─────────────────────────────────────────────

  describe('ColorTheme.stripAnsi', () => {
    it('removes ANSI escape codes from a string', () => {
      const input = '\x1b[31mError\x1b[0m'
      expect(ColorTheme.stripAnsi(input)).toBe('Error')
    })

    it('returns plain text unchanged', () => {
      expect(ColorTheme.stripAnsi('hello world')).toBe('hello world')
    })

    it('handles multiple escape sequences', () => {
      const input = '\x1b[1m\x1b[31mBold Red\x1b[0m'
      expect(ColorTheme.stripAnsi(input)).toBe('Bold Red')
    })

    it('handles empty string', () => {
      expect(ColorTheme.stripAnsi('')).toBe('')
    })

    it('strips 256-color codes', () => {
      const input = '\x1b[38;5;197mPink\x1b[0m'
      expect(ColorTheme.stripAnsi(input)).toBe('Pink')
    })

    it('strips complex sequences', () => {
      const input = '\x1b[38;2;255;0;0mRGB Red\x1b[0m'
      expect(ColorTheme.stripAnsi(input)).toBe('RGB Red')
    })
  })

  // ─── getConfig ──────────────────────────────────────────────────────

  describe('getConfig', () => {
    it('returns default config with no custom themes', () => {
      const ct = new ColorTheme()
      const config = ct.getConfig()
      expect(config.activeTheme).toBe('default')
      expect(config.customThemes).toEqual([])
    })

    it('returns active theme name', () => {
      const ct = new ColorTheme({ activeTheme: 'solarized' })
      const config = ct.getConfig()
      expect(config.activeTheme).toBe('solarized')
    })

    it('includes custom themes excluding presets', () => {
      const custom: ThemeDefinition = {
        name: 'mine',
        colors: { ...DEFAULT_THEME_COLORS },
        isDark: false,
      }
      const ct = new ColorTheme({ customThemes: [custom] })
      const config = ct.getConfig()
      expect(config.customThemes).toHaveLength(1)
      expect(config.customThemes[0].name).toBe('mine')
    })

    it('reflects dynamically registered themes', () => {
      const ct = new ColorTheme()
      ct.registerTheme({
        name: 'dynamic',
        colors: { ...DEFAULT_THEME_COLORS },
        isDark: true,
      })
      const config = ct.getConfig()
      expect(config.customThemes).toHaveLength(1)
      expect(config.customThemes[0].name).toBe('dynamic')
    })

    it('does not include removed custom themes', () => {
      const ct = new ColorTheme()
      ct.registerTheme({
        name: 'to-remove',
        colors: { ...DEFAULT_THEME_COLORS },
        isDark: true,
      })
      ct.removeTheme('to-remove')
      const config = ct.getConfig()
      expect(config.customThemes).toHaveLength(0)
    })
  })
})

// ─── ThemeManager ──────────────────────────────────────────────────────

describe('ThemeManager', () => {
  // ─── mergeThemes ────────────────────────────────────────────────────

  describe('mergeThemes', () => {
    it('returns base colors when overrides is empty', () => {
      const mgr = new ThemeManager()
      const result = mgr.mergeThemes(DEFAULT_THEME_COLORS, {})
      expect(result).toEqual(DEFAULT_THEME_COLORS)
    })

    it('overrides specified color fields', () => {
      const mgr = new ThemeManager()
      const result = mgr.mergeThemes(DEFAULT_THEME_COLORS, { error: '\x1b[35m' })
      expect(result.error).toBe('\x1b[35m')
      expect(result.warning).toBe(DEFAULT_THEME_COLORS.warning)
    })

    it('overrides multiple fields', () => {
      const mgr = new ThemeManager()
      const result = mgr.mergeThemes(DEFAULT_THEME_COLORS, {
        error: '\x1b[31m',
        success: '\x1b[32m',
      })
      expect(result.error).toBe('\x1b[31m')
      expect(result.success).toBe('\x1b[32m')
      expect(result.info).toBe(DEFAULT_THEME_COLORS.info)
    })

    it('does not mutate the base object', () => {
      const mgr = new ThemeManager()
      const base: ThemeColors = { ...DEFAULT_THEME_COLORS }
      mgr.mergeThemes(base, { error: '\x1b[35m' })
      expect(base.error).toBe(DEFAULT_THEME_COLORS.error)
    })
  })

  // ─── createTheme ────────────────────────────────────────────────────

  describe('createTheme', () => {
    it('creates a theme definition with default isDark', () => {
      const mgr = new ThemeManager()
      const theme = mgr.createTheme('test', DEFAULT_THEME_COLORS)
      expect(theme.name).toBe('test')
      expect(theme.colors).toBe(DEFAULT_THEME_COLORS)
      expect(theme.isDark).toBe(true)
    })

    it('creates a theme with isDark=false', () => {
      const mgr = new ThemeManager()
      const theme = mgr.createTheme('light', DEFAULT_THEME_COLORS, false)
      expect(theme.isDark).toBe(false)
    })

    it('creates independent theme definitions', () => {
      const mgr = new ThemeManager()
      const a = mgr.createTheme('a', DEFAULT_THEME_COLORS)
      const b = mgr.createTheme('b', DEFAULT_THEME_COLORS)
      expect(a.name).not.toBe(b.name)
    })
  })

  // ─── validateTheme ──────────────────────────────────────────────────

  describe('validateTheme', () => {
    it('returns empty errors for a valid theme', () => {
      const mgr = new ThemeManager()
      const theme: ThemeDefinition = {
        name: 'valid',
        colors: DEFAULT_THEME_COLORS,
        isDark: true,
      }
      expect(mgr.validateTheme(theme)).toEqual([])
    })

    it('returns error for empty name', () => {
      const mgr = new ThemeManager()
      const theme: ThemeDefinition = {
        name: '',
        colors: DEFAULT_THEME_COLORS,
        isDark: true,
      }
      const errors = mgr.validateTheme(theme)
      expect(errors).toContain('Theme name is required')
    })

    it('returns error for whitespace-only name', () => {
      const mgr = new ThemeManager()
      const theme: ThemeDefinition = {
        name: '   ',
        colors: DEFAULT_THEME_COLORS,
        isDark: true,
      }
      const errors = mgr.validateTheme(theme)
      expect(errors).toContain('Theme name is required')
    })

    it('returns error for missing color field', () => {
      const mgr = new ThemeManager()
      const incomplete: ThemeDefinition = {
        name: 'bad',
        colors: { ...DEFAULT_THEME_COLORS, error: '' },
        isDark: true,
      }
      const errors = mgr.validateTheme(incomplete)
      expect(errors).toContain('Missing required color field: error')
    })

    it('returns multiple errors for multiple missing fields', () => {
      const mgr = new ThemeManager()
      const emptyColors: ThemeColors = {
        error: '',
        warning: '',
        success: '',
        info: '',
        debug: '',
        highlight: '',
        dim: '',
        bold: '',
        reset: '',
      }
      const theme: ThemeDefinition = {
        name: '',
        colors: emptyColors,
        isDark: true,
      }
      const errors = mgr.validateTheme(theme)
      // 1 for name + 9 for color fields
      expect(errors).toHaveLength(10)
    })
  })

  // ─── resolveColor ───────────────────────────────────────────────────

  describe('resolveColor', () => {
    it('returns the color code as-is', () => {
      const mgr = new ThemeManager()
      expect(mgr.resolveColor('\x1b[31m')).toBe('\x1b[31m')
    })

    it('returns empty string unchanged', () => {
      const mgr = new ThemeManager()
      expect(mgr.resolveColor('')).toBe('')
    })

    it('returns 256-color codes unchanged', () => {
      const mgr = new ThemeManager()
      expect(mgr.resolveColor('\x1b[38;5;197m')).toBe('\x1b[38;5;197m')
    })
  })
})

// ─── Types & Constants ─────────────────────────────────────────────────

describe('types and constants', () => {
  it('DEFAULT_THEME_COLORS has all required keys', () => {
    const keys: (keyof ThemeColors)[] = [
      'error', 'warning', 'success', 'info', 'debug',
      'highlight', 'dim', 'bold', 'reset',
    ]
    for (const key of keys) {
      expect(DEFAULT_THEME_COLORS).toHaveProperty(key)
      expect(typeof DEFAULT_THEME_COLORS[key]).toBe('string')
    }
  })

  it('PRESET_THEMES contains exactly 4 themes', () => {
    expect(PRESET_THEMES).toHaveLength(4)
  })

  it('each preset theme has required properties', () => {
    for (const theme of PRESET_THEMES) {
      expect(typeof theme.name).toBe('string')
      expect(theme.name.length).toBeGreaterThan(0)
      expect(typeof theme.isDark).toBe('boolean')
      expect(typeof theme.colors).toBe('object')
      expect(theme.colors).toHaveProperty('error')
      expect(theme.colors).toHaveProperty('reset')
    }
  })

  it('preset themes have unique names', () => {
    const names = PRESET_THEMES.map(t => t.name)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })
})

// ─── Integration ───────────────────────────────────────────────────────

describe('integration', () => {
  it('end-to-end: create, register, use, and remove a theme', () => {
    const mgr = new ThemeManager()
    const customColors = mgr.mergeThemes(DEFAULT_THEME_COLORS, {
      error: '\x1b[38;5;197m',
      highlight: '\x1b[38;5;228m',
    })
    const theme = mgr.createTheme('neon', customColors, true)
    const errors = mgr.validateTheme(theme)
    expect(errors).toEqual([])

    const ct = new ColorTheme()
    ct.registerTheme(theme)
    ct.setTheme('neon')
    expect(ct.getTheme().name).toBe('neon')

    const colored = ct.colorize('test', 'error')
    expect(colored).toContain('\x1b[38;5;197m')
    expect(colored).toContain('test')
    expect(ColorTheme.stripAnsi(colored)).toBe('test')

    ct.removeTheme('neon')
    expect(ct.getTheme().name).toBe('default')
  })

  it('getConfig round-trips through new ColorTheme', () => {
    const ct1 = new ColorTheme()
    ct1.registerTheme({
      name: 'round-trip',
      colors: { ...DEFAULT_THEME_COLORS, error: '\x1b[35m' },
      isDark: false,
    })
    ct1.setTheme('round-trip')
    const config: ThemeConfig = ct1.getConfig()

    const ct2 = new ColorTheme(config)
    expect(ct2.getTheme().name).toBe('round-trip')
    expect(ct2.getColors().error).toBe('\x1b[35m')
  })

  it('theme manager validation catches invalid theme before registration', () => {
    const mgr = new ThemeManager()
    const badTheme: ThemeDefinition = {
      name: '',
      colors: { ...DEFAULT_THEME_COLORS, error: '' },
      isDark: true,
    }
    const errors = mgr.validateTheme(badTheme)
    expect(errors.length).toBeGreaterThan(0)
    // Do not register — as expected by validation
  })
})
