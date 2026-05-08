import type { PrintOptions } from './types.js'
import { DEFAULT_PRINT_OPTIONS } from './types.js'

export class CodePrinter {
  private lines: string[] = []
  private currentLine: string = ''
  private indentLevel: number = 0
  private options: PrintOptions

  constructor(options: Partial<PrintOptions> = {}) {
    this.options = { ...DEFAULT_PRINT_OPTIONS, ...options }
  }

  write(text: string): void {
    this.currentLine += text
  }

  writeLine(text: string = ''): void {
    this.currentLine += text
    this.lines.push(this.currentLine)
    this.currentLine = ''
  }

  indent(): void {
    this.indentLevel++
  }

  dedent(): void {
    if (this.indentLevel > 0) {
      this.indentLevel--
    }
  }

  writeIndent(): void {
    if (this.options.compress) {
      if (this.currentLine.length > 0) {
        this.currentLine += ' '
      }
      return
    }
    this.currentLine += this.getCurrentIndent()
  }

  newLine(): void {
    if (this.options.compress) {
      this.currentLine += ' '
      return
    }
    this.lines.push(this.currentLine)
    this.currentLine = ''
  }

  getResult(): string {
    const allLines = [...this.lines]
    if (this.currentLine.length > 0) {
      allLines.push(this.currentLine)
    }
    let result = allLines.join('\n')
    if (this.options.trailingNewline && !this.options.compress) {
      result += '\n'
    }
    if (this.options.compress) {
      result = result.replace(/\s+/g, ' ').trim()
    }
    return result
  }

  reset(): void {
    this.lines = []
    this.currentLine = ''
    this.indentLevel = 0
  }

  getCurrentIndent(): string {
    if (this.indentLevel === 0) return ''
    const char = this.options.indentStyle === 'tab' ? '\t' : ' '
    const size = this.options.indentStyle === 'tab' ? 1 : this.options.indentSize
    return char.repeat(this.indentLevel * size)
  }

  getLineCount(): number {
    const count = this.lines.length
    if (this.currentLine.length > 0) {
      return count + 1
    }
    return count
  }

  getOptions(): PrintOptions {
    return { ...this.options }
  }

  getIndentLevel(): number {
    return this.indentLevel
  }

  wrapText(text: string, maxWidth?: number): string[] {
    const width = maxWidth ?? this.options.maxWidth
    const indent = this.getCurrentIndent()
    const effectiveWidth = width - indent.length
    if (effectiveWidth <= 0) return [indent + text]
    const words = text.split(/\s+/)
    const result: string[] = []
    let currentLine = ''
    for (const word of words) {
      if (word.length === 0) continue
      if (currentLine.length === 0) {
        currentLine = word
      } else if (currentLine.length + 1 + word.length <= effectiveWidth) {
        currentLine += ' ' + word
      } else {
        result.push(indent + currentLine)
        currentLine = word
      }
    }
    if (currentLine.length > 0) {
      result.push(indent + currentLine)
    }
    return result
  }
}
