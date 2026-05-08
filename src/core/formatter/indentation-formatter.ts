import type { FormatterConfig, FormatResult, FormatChange } from './types.js'

export class IndentationFormatter {
  format(source: string, config: FormatterConfig): FormatResult {
    const changes: FormatChange[] = []
    let result = source

    const trimmed = this.trimTrailingWhitespace(result)
    if (trimmed !== result) {
      const originalLines = result.split('\n')
      const trimmedLines = trimmed.split('\n')
      for (let i = 0; i < originalLines.length; i++) {
        if (originalLines[i] !== trimmedLines[i]) {
          changes.push({
            line: i + 1,
            type: 'whitespace',
            description: 'Removed trailing whitespace',
          })
        }
      }
      result = trimmed
    }

    const normalized = this.normalizeIndentation(result, config.indentStyle, config.indentSize)
    if (normalized !== result) {
      const originalLines = result.split('\n')
      const normalizedLines = normalized.split('\n')
      for (let i = 0; i < originalLines.length; i++) {
        if (originalLines[i] !== normalizedLines[i]) {
          changes.push({
            line: i + 1,
            type: 'indent',
            description: `Normalized indentation to ${config.indentStyle === 'space' ? config.indentSize + ' spaces' : 'tabs'}`,
          })
        }
      }
      result = normalized
    }

    const withNewline = this.ensureFinalNewline(result)
    if (withNewline !== result) {
      changes.push({
        line: result.split('\n').length + 1,
        type: 'newline',
        description: 'Added final newline',
      })
      result = withNewline
    }

    if (config.trimTrailingWhitespace) {
      const retrimmed = this.trimTrailingWhitespace(result)
      if (retrimmed !== result) {
        result = retrimmed
      }
    }

    return {
      source: result,
      changed: changes.length > 0,
      changes,
    }
  }

  normalizeIndentation(source: string, style: 'space' | 'tab', size: number): string {
    const lines = source.split('\n')
    return lines
      .map((line) => {
        const leadingWhitespace = line.match(/^[\t ]*/)?.[0] ?? ''
        if (leadingWhitespace.length === 0) return line

        let spaceCount = 0
        let tabCount = 0
        for (const ch of leadingWhitespace) {
          if (ch === ' ') spaceCount++
          else tabCount++
        }

        const effectiveSize = size > 0 ? size : 2
        const totalIndent = spaceCount / effectiveSize + tabCount

        let newIndent: string
        if (style === 'space') {
          newIndent = ' '.repeat(Math.round(totalIndent) * effectiveSize)
        } else {
          newIndent = '\t'.repeat(Math.round(totalIndent))
        }

        return newIndent + line.slice(leadingWhitespace.length)
      })
      .join('\n')
  }

  detectIndentStyle(source: string): { style: 'space' | 'tab'; size: number } {
    const lines = source.split('\n')
    const spaceIndents: number[] = []
    const tabIndents: number[] = []

    for (const line of lines) {
      const match = line.match(/^( +)/)
      if (match) {
        spaceIndents.push(match[1]?.length ?? 0)
      }
      const tabMatch = line.match(/^(\t+)/)
      if (tabMatch) {
        tabIndents.push(tabMatch[1]?.length ?? 0)
      }
    }

    if (tabIndents.length > spaceIndents.length) {
      return { style: 'tab', size: 1 }
    }

    if (spaceIndents.length === 0) {
      return { style: 'space', size: 2 }
    }

    const sorted = [...spaceIndents].sort((a, b) => a - b)
    const minIndent = sorted[0] ?? 2
    const size = minIndent > 0 ? minIndent : 2

    return { style: 'space', size }
  }

  trimTrailingWhitespace(source: string): string {
    return source
      .split('\n')
      .map((line) => line.replace(/[\t ]+$/, ''))
      .join('\n')
  }

  ensureFinalNewline(source: string): string {
    if (source.length === 0) return '\n'
    if (source.endsWith('\n')) return source
    return source + '\n'
  }
}
