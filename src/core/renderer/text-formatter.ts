import type { TextStyle } from './types.js'

const ESC = '\x1b['

const COLOR_CODES: Record<string, number> = {
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  gray: 90,
}

const BG_COLOR_CODES: Record<string, number> = {
  red: 41,
  green: 42,
  yellow: 43,
  blue: 44,
  magenta: 45,
  cyan: 46,
  white: 47,
}

export class TextFormatter {
  format(text: string, style: TextStyle): string {
    const codes: number[] = []
    if (style.bold) codes.push(1)
    if (style.italic) codes.push(3)
    if (style.underline) codes.push(4)
    if (style.dim) codes.push(2)
    if (style.color !== 'white' && COLOR_CODES[style.color]) codes.push(COLOR_CODES[style.color]!)
    if (style.bg && BG_COLOR_CODES[style.bg]) codes.push(BG_COLOR_CODES[style.bg]!)
    if (codes.length === 0) return text
    return `${ESC}${codes.join(';')}m${text}${ESC}0m`
  }

  bold(text: string): string {
    return `${ESC}1m${text}${ESC}0m`
  }

  dim(text: string): string {
    return `${ESC}2m${text}${ESC}0m`
  }

  colorize(text: string, color: TextStyle['color']): string {
    const code = COLOR_CODES[color]
    if (code === undefined) return text
    return `${ESC}${code}m${text}${ESC}0m`
  }

  stripColors(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '')
  }

  wordWrap(text: string, maxWidth: number): string {
    if (maxWidth <= 0) return text
    const lines: string[] = []
    const paragraphs = text.split('\n')
    for (const paragraph of paragraphs) {
      if (paragraph.length <= maxWidth) {
        lines.push(paragraph)
        continue
      }
      const words = paragraph.split(' ')
      let currentLine = ''
      for (const word of words) {
        if (currentLine.length === 0) {
          currentLine = word
        } else if (currentLine.length + 1 + word.length <= maxWidth) {
          currentLine += ' ' + word
        } else {
          lines.push(currentLine)
          currentLine = word
        }
      }
      if (currentLine.length > 0) {
        lines.push(currentLine)
      }
    }
    return lines.join('\n')
  }

  indent(text: string, indent: string): string {
    return text
      .split('\n')
      .map((line) => indent + line)
      .join('\n')
  }

  center(text: string, width: number): string {
    const stripped = this.stripColors(text)
    const visibleLen = stripped.length
    if (visibleLen >= width) return text
    const totalPad = width - visibleLen
    const leftPad = Math.floor(totalPad / 2)
    const rightPad = totalPad - leftPad
    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad)
  }

  truncate(text: string, maxWidth: number, suffix: string = '...'): string {
    if (text.length <= maxWidth) return text
    if (maxWidth < suffix.length) return text.slice(0, maxWidth)
    return text.slice(0, maxWidth - suffix.length) + suffix
  }

  pluralize(count: number, singular: string, plural?: string): string {
    if (count === 1) return `${count} ${singular}`
    const pluralForm = plural ?? `${singular}s`
    return `${count} ${pluralForm}`
  }
}
