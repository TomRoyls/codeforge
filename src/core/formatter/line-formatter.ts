import type { FormatterConfig, FormatResult, FormatChange } from './types.js'

export class LineFormatter {
  format(source: string, config: FormatterConfig): FormatResult {
    const changes: FormatChange[] = []
    let result = source

    const withQuotes = this.normalizeQuotes(result, config.singleQuotes)
    if (withQuotes !== result) {
      const originalLines = result.split('\n')
      const quoteLines = withQuotes.split('\n')
      for (let i = 0; i < originalLines.length; i++) {
        if (originalLines[i] !== quoteLines[i]) {
          changes.push({
            line: i + 1,
            type: 'quote',
            description: config.singleQuotes ? 'Converted to single quotes' : 'Converted to double quotes',
          })
        }
      }
      result = withQuotes
    }

    const withSemicolons = this.normalizeSemicolons(result, config.semicolons)
    if (withSemicolons !== result) {
      const originalLines = result.split('\n')
      const semiLines = withSemicolons.split('\n')
      for (let i = 0; i < originalLines.length; i++) {
        if (originalLines[i] !== semiLines[i]) {
          changes.push({
            line: i + 1,
            type: 'semicolon',
            description: config.semicolons ? 'Added semicolons' : 'Removed semicolons',
          })
        }
      }
      result = withSemicolons
    }

    const withTrailingCommas = this.normalizeTrailingCommas(result, config.trailingComma)
    if (withTrailingCommas !== result) {
      const originalLines = result.split('\n')
      const commaLines = withTrailingCommas.split('\n')
      for (let i = 0; i < originalLines.length; i++) {
        if (originalLines[i] !== commaLines[i]) {
          changes.push({
            line: i + 1,
            type: 'trailing-comma',
            description: `Normalized trailing commas to ${config.trailingComma}`,
          })
        }
      }
      result = withTrailingCommas
    }

    const withLineLength = this.enforceMaxLineLength(result, config.maxLineLength)
    if (withLineLength !== result) {
      const originalLines = result.split('\n')
      const lengthLines = withLineLength.split('\n')
      for (let i = 0; i < originalLines.length; i++) {
        if (originalLines[i] !== lengthLines[i]) {
          changes.push({
            line: i + 1,
            type: 'line-length',
            description: `Line exceeded ${config.maxLineLength} characters`,
          })
        }
      }
      result = withLineLength
    }

    return {
      source: result,
      changed: changes.length > 0,
      changes,
    }
  }

  enforceMaxLineLength(source: string, maxLength: number): string {
    const lines = source.split('\n')
    const result: string[] = []

    for (const line of lines) {
      if (line.length <= maxLength) {
        result.push(line)
        continue
      }

      const indentMatch = line.match(/^(\s*)/)
      const indent = indentMatch?.[1] ?? ''
      const content = line.trim()

      const logicalBreaks = this.findBreakPoints(content, maxLength - indent.length)
      if (logicalBreaks.length === 0) {
        result.push(line)
        continue
      }

      let current = indent + content
      let safety = 20
      while (current.length > maxLength && safety > 0) {
        safety--
        let bestBreak = -1
        let bestPos = -1

        for (const breakChar of [',', ' ', '(', '{', '|', '&']) {
          const pos = current.lastIndexOf(breakChar, maxLength)
          if (pos > indent.length && pos > bestPos) {
            bestPos = pos
            bestBreak = pos
          }
        }

        if (bestBreak <= indent.length) break

        const before = current.slice(0, bestBreak).trimEnd()
        const after = current.slice(bestBreak).trimStart()
        result.push(before)

        current = indent + '  ' + after
      }

      if (current.length > 0) {
        result.push(current)
      }
    }

    return result.join('\n')
  }

  private findBreakPoints(content: string, _availableWidth: number): number[] {
    const points: number[] = []
    for (let i = 0; i < content.length; i++) {
      const ch = content[i]
      if (ch === ',' || ch === ' ' || ch === '(' || ch === '{') {
        points.push(i)
      }
    }
    return points
  }

  normalizeQuotes(source: string, singleQuotes: boolean): string {
    const targetQuote = singleQuotes ? "'" : '"'
    const otherQuote = singleQuotes ? '"' : "'"
    const result: string[] = []

    for (const line of source.split('\n')) {
      const importMatch = line.match(/^(import\s+(?:type\s+)?(?:[^'"]*\s+from\s+|[^'"]*\{[^}]*\}\s*from\s+|[^'"]*\*\s+as\s+\w+\s+from\s+)?)(['"])([^'"]*)\2/)
      if (importMatch) {
        const prefix = importMatch[1]!
        const modulePath = importMatch[3]!
        const suffix = line.slice(importMatch[0].length)
        result.push(prefix + targetQuote + modulePath + targetQuote + suffix)
        continue
      }

      result.push(this.convertStringQuotes(line, targetQuote, otherQuote))
    }

    return result.join('\n')
  }

  private convertStringQuotes(line: string, targetQuote: string, otherQuote: string): string {
    if (!line.includes(otherQuote)) return line

    const chars = [...line]
    const output: string[] = []
    let i = 0

    while (i < chars.length) {
      const ch = chars[i]!

      if (ch === '/' && i + 1 < chars.length) {
        const next = chars[i + 1]!
        if (next === '/') {
          output.push(...chars.slice(i))
          break
        }
        if (next === '*') {
          output.push(chars[i]!)
          output.push(chars[i + 1]!)
          i += 2
          while (i < chars.length) {
            output.push(chars[i]!)
            if (chars[i] === '/' && i > 0 && chars[i - 1] === '*') {
              i++
              break
            }
            i++
          }
          continue
        }
      }

      if (ch === '`') {
        output.push(ch)
        i++
        while (i < chars.length) {
          output.push(chars[i]!)
          if (chars[i] === '`') {
            i++
            break
          }
          if (chars[i] === '\\') {
            i++
            if (i < chars.length) {
              output.push(chars[i]!)
              i++
            }
            continue
          }
          i++
        }
        continue
      }

      if (ch === otherQuote) {
        output.push(targetQuote)
        i++
        const inner: string[] = []
        while (i < chars.length && chars[i] !== otherQuote) {
          if (chars[i] === '\\') {
            const nextCh = chars[i + 1]
            if (nextCh === otherQuote) {
              inner.push(nextCh)
              i += 2
              continue
            }
            inner.push(chars[i]!)
            i++
            if (i < chars.length) {
              inner.push(chars[i]!)
              i++
            }
            continue
          }
          if (chars[i] === targetQuote) {
            inner.push('\\')
            inner.push(targetQuote)
          } else {
            inner.push(chars[i]!)
          }
          i++
        }
        for (const c of inner) {
          output.push(c)
        }
        if (i < chars.length) {
          output.push(targetQuote)
          i++
        }
        continue
      }

      if (ch === targetQuote) {
        output.push(ch)
        i++
        while (i < chars.length && chars[i] !== targetQuote) {
          if (chars[i] === '\\') {
            output.push(chars[i]!)
            i++
            if (i < chars.length) {
              output.push(chars[i]!)
              i++
            }
            continue
          }
          output.push(chars[i]!)
          i++
        }
        if (i < chars.length) {
          output.push(chars[i]!)
          i++
        }
        continue
      }

      output.push(ch)
      i++
    }

    return output.join('')
  }

  normalizeSemicolons(source: string, useSemicolons: boolean): string {
    const lines = source.split('\n')
    return lines
      .map((line) => {
        const trimmed = line.trim()

        if (trimmed === '') return line
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return line
        if (trimmed.startsWith('import ') && !trimmed.includes('from')) return line
        if (trimmed.endsWith('{') || trimmed.endsWith('(') || trimmed.endsWith('[')) return line
        if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
          if (useSemicolons && !trimmed.endsWith(';') && !trimmed.endsWith(',') && !trimmed.endsWith(':')) {
            return line + ';'
          }
          if (!useSemicolons && trimmed.endsWith(';')) {
            return line.slice(0, -1)
          }
          return line
        }
        if (trimmed.startsWith('export ') && trimmed.endsWith('{')) return line
        if (trimmed.startsWith('case ') || trimmed.startsWith('default:')) return line
        if (trimmed.startsWith('if') || trimmed.startsWith('for') || trimmed.startsWith('while') || trimmed.startsWith('switch')) {
          if (trimmed.endsWith(')')) return line
        }
        if (trimmed.startsWith('@')) return line
        if (trimmed.startsWith('...')) return line
        if (trimmed.endsWith(',')) return line
        if (trimmed.endsWith(':')) return line
        if (trimmed.startsWith('#!')) return line
        if (trimmed.startsWith('interface ') || trimmed.startsWith('type ') || trimmed.startsWith('enum ')) {
          if (trimmed.endsWith('{')) return line
        }

        if (useSemicolons) {
          if (!trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('(')) {
            return line + ';'
          }
        } else {
          if (trimmed.endsWith(';')) {
            const nonTrailingBrace = !trimmed.endsWith('{}') && !trimmed.endsWith('();')
            if (nonTrailingBrace) {
              return line.slice(0, line.lastIndexOf(';'))
            }
            return line.slice(0, -1)
          }
        }

        return line
      })
      .join('\n')
  }

  normalizeTrailingCommas(source: string, style: 'none' | 'es5' | 'all'): string {
    if (style === 'none') {
      return source.replace(/,\s*([}\]])/g, '$1')
    }

    if (style === 'es5' || style === 'all') {
      return source
    }

    return source
  }

  countLines(source: string): { total: number; code: number; blank: number; comment: number } {
    const lines = source.split('\n')
    let code = 0
    let blank = 0
    let comment = 0
    let inBlockComment = false

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed === '') {
        blank++
        continue
      }

      if (inBlockComment) {
        comment++
        if (trimmed.includes('*/')) {
          inBlockComment = false
        }
        continue
      }

      if (trimmed.startsWith('/*')) {
        comment++
        if (!trimmed.includes('*/') || trimmed.endsWith('/*')) {
          inBlockComment = true
        }
        continue
      }

      if (trimmed.startsWith('//')) {
        comment++
        continue
      }

      code++
    }

    return {
      total: lines.length,
      code,
      blank,
      comment,
    }
  }
}
