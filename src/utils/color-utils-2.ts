import type { RGB } from './color-space-2.js'

export class ColorUtils2 {
  static lighten(color: RGB, amount: number): RGB {
    return { r: Math.min(255, color.r + amount), g: Math.min(255, color.g + amount), b: Math.min(255, color.b + amount) }
  }

  static darken(color: RGB, amount: number): RGB {
    return { r: Math.max(0, color.r - amount), g: Math.max(0, color.g - amount), b: Math.max(0, color.b - amount) }
  }

  static invert(color: RGB): RGB {
    return { r: 255 - color.r, g: 255 - color.g, b: 255 - color.b }
  }

  static grayscale(color: RGB): RGB {
    const v = Math.round(0.299 * color.r + 0.587 * color.g + 0.114 * color.b)
    return { r: v, g: v, b: v }
  }

  static sepia(color: RGB): RGB {
    return {
      r: Math.min(255, Math.round(color.r * 0.393 + color.g * 0.769 + color.b * 0.189)),
      g: Math.min(255, Math.round(color.r * 0.349 + color.g * 0.686 + color.b * 0.168)),
      b: Math.min(255, Math.round(color.r * 0.272 + color.g * 0.534 + color.b * 0.131)),
    }
  }

  static contrast(foreground: RGB, background: RGB): number {
    const l1 = ColorUtils2.relativeLuminance(foreground)
    const l2 = ColorUtils2.relativeLuminance(background)
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  }

  static relativeLuminance({ r, g, b }: RGB): number {
    const toLinear = (v: number) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  }

  static isDark(color: RGB): boolean {
    return ColorUtils2.relativeLuminance(color) < 0.5
  }

  static isLight(color: RGB): boolean {
    return !ColorUtils2.isDark(color)
  }

  static random(): RGB {
    return { r: Math.floor(Math.random() * 256), g: Math.floor(Math.random() * 256), b: Math.floor(Math.random() * 256) }
  }

  static clamp(color: RGB): RGB {
    const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
    return { r: c(color.r), g: c(color.g), b: c(color.b) }
  }

  static equals(a: RGB, b: RGB): boolean {
    return a.r === b.r && a.g === b.g && a.b === b.b
  }

  toArray(): number[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): ColorUtils2 { return new ColorUtils2() }
  equalsType(other: unknown): boolean { return other instanceof ColorUtils2 }
}
