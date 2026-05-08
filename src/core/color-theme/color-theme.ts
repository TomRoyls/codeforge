import type { ThemeConfig, ThemeDefinition, ThemeColors } from './types.js'
import { PRESET_THEMES } from './types.js'

export class ColorTheme {
  private themes: Map<string, ThemeDefinition>
  private activeThemeName: string

  constructor(config?: Partial<ThemeConfig>) {
    this.themes = new Map<string, ThemeDefinition>()
    this.activeThemeName = config?.activeTheme ?? 'default'

    for (const theme of PRESET_THEMES) {
      this.themes.set(theme.name, theme)
    }

    const customThemes = config?.customThemes ?? []
    for (const theme of customThemes) {
      this.themes.set(theme.name, theme)
    }

    if (!this.themes.has(this.activeThemeName)) {
      this.activeThemeName = 'default'
    }
  }

  setTheme(name: string): void {
    if (!this.themes.has(name)) {
      throw new Error(`Theme not found: ${name}`)
    }
    this.activeThemeName = name
  }

  getTheme(name?: string): ThemeDefinition {
    const themeName = name ?? this.activeThemeName
    const theme = this.themes.get(themeName)
    if (!theme) {
      throw new Error(`Theme not found: ${themeName}`)
    }
    return theme
  }

  getColors(name?: string): ThemeColors {
    return this.getTheme(name).colors
  }

  colorize(text: string, colorName: keyof ThemeColors): string {
    const colors = this.getColors()
    const colorCode = colors[colorName]
    const resetCode = colors.reset
    return `${colorCode}${text}${resetCode}`
  }

  registerTheme(theme: ThemeDefinition): void {
    this.themes.set(theme.name, theme)
  }

  listThemes(): string[] {
    return [...this.themes.keys()]
  }

  removeTheme(name: string): void {
    const presetNames = PRESET_THEMES.map(t => t.name)
    if (presetNames.includes(name)) {
      throw new Error(`Cannot remove preset theme: ${name}`)
    }
    if (!this.themes.has(name)) {
      throw new Error(`Theme not found: ${name}`)
    }
    if (this.activeThemeName === name) {
      this.activeThemeName = 'default'
    }
    this.themes.delete(name)
  }

  static stripAnsi(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '')
  }

  getConfig(): ThemeConfig {
    const presetNames = new Set(PRESET_THEMES.map(t => t.name))
    const customThemes: ThemeDefinition[] = []
    for (const [name, theme] of this.themes) {
      if (!presetNames.has(name)) {
        customThemes.push(theme)
      }
    }
    return {
      activeTheme: this.activeThemeName,
      customThemes,
    }
  }
}
