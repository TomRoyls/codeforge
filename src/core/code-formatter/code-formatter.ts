import type { FormatOptions, FormatResult, FormatRange, FormatError, ChangeDescription } from './types.js'
import { DEFAULT_FORMAT_OPTIONS } from './types.js'

export class CodeFormatter {
  private options: FormatOptions

  constructor(options?: Partial<FormatOptions>) {
    this.options = { ...DEFAULT_FORMAT_OPTIONS, ...options }
  }

  format(code: string): FormatResult {
    const errors: FormatError[] = []
    let result = code

    result = this.normalizeLineEndings(result, 'lf')
    result = this.trimTrailingWhitespace(result)
    result = this.normalizeIndentation(result)
    result = this.enforceQuotes(result, this.options.singleQuotes)
    result = this.enforceSemicolonsInternal(result)
    result = this.enforceTrailingCommas(result)
    result = this.normalizeLineEndings(result, this.options.endOfLine)

    const changed = result !== code
    return { formatted: result, changed, errors }
  }

  formatRange(code: string, range: FormatRange): FormatResult {
    const errors: FormatError[] = []
    const lines = this.splitLines(code)
    const totalLines = lines.length

    if (range.startLine < 0 || range.endLine >= totalLines || range.startLine > range.endLine) {
      errors.push({ line: range.startLine, column: 0, message: 'Invalid range' })
      return { formatted: code, changed: false, errors }
    }

    const rangeCode = lines.slice(range.startLine, range.endLine + 1).join('\n')
    const formattedRange = this.formatRangeOnly(rangeCode)

    const beforeLines = lines.slice(0, range.startLine)
    const afterLines = lines.slice(range.endLine + 1)
    const formattedLines = this.splitLines(formattedRange)

    const newLines = [...beforeLines, ...formattedLines, ...afterLines]
    const result = newLines.join('\n')
    const changed = result !== code

    return { formatted: result, changed, errors }
  }

  formatLine(code: string, lineNumber: number): FormatResult {
    const lines = this.splitLines(code)
    const errors: FormatError[] = []

    if (lineNumber < 0 || lineNumber >= lines.length) {
      errors.push({ line: lineNumber, column: 0, message: 'Line number out of range' })
      return { formatted: code, changed: false, errors }
    }

    const originalLine = lines[lineNumber]!
    let formattedLine = originalLine
    formattedLine = formattedLine.trimEnd()
    formattedLine = this.normalizeLineIndent(formattedLine)

    lines[lineNumber] = formattedLine
    const result = lines.join('\n')
    const changed = result !== code

    return { formatted: result, changed, errors }
  }

  check(code: string): { changed: boolean; changes: ChangeDescription[] } {
    const changes: ChangeDescription[] = []
    const result = this.format(code)

    if (!result.changed) {
      return { changed: false, changes }
    }

    const originalLines = this.splitLines(code)
    const formattedLines = this.splitLines(result.formatted)
    const maxLines = Math.max(originalLines.length, formattedLines.length)

    for (let i = 0; i < maxLines; i++) {
      const origLine = i < originalLines.length ? originalLines[i] : undefined
      const fmtLine = i < formattedLines.length ? formattedLines[i] : undefined

      if (origLine !== fmtLine) {
        if (origLine === undefined) {
          changes.push({ line: i + 1, column: 0, type: 'add', message: 'Line added' })
        } else if (fmtLine === undefined) {
          changes.push({ line: i + 1, column: 0, type: 'remove', message: 'Line removed' })
        } else if (origLine !== fmtLine) {
          changes.push({ line: i + 1, column: 0, type: 'modify', message: 'Line modified' })
        }
      }
    }

    return { changed: true, changes }
  }

  indent(code: string, level: number): string {
    if (level <= 0) return code

    const indentChar = this.options.useTabs ? '\t' : ' '.repeat(this.options.indentSize)
    const prefix = indentChar.repeat(level)
    const lines = this.splitLines(code)

    return lines.map((line) => {
      if (line.trim() === '') return line
      return prefix + line
    }).join('\n')
  }

  trimTrailingWhitespace(code: string): string {
    const lines = this.splitLines(code)
    return lines.map((line) => line.trimEnd()).join('\n')
  }

  normalizeLineEndings(code: string, eol: 'lf' | 'crlf'): string {
    const normalized = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    if (eol === 'crlf') {
      return normalized.replace(/\n/g, '\r\n')
    }
    return normalized
  }

  enforceSemicolons(code: string): string {
    return this.addSemicolons(code)
  }

  enforceQuotes(code: string, single: boolean): string {
    return this.convertQuotes(code, single)
  }

  getOptions(): FormatOptions {
    return { ...this.options }
  }

  mergeOptions(options: Partial<FormatOptions>): CodeFormatter {
    return new CodeFormatter({ ...this.options, ...options })
  }

  private normalizeIndentation(code: string): string {
    const lines = this.splitLines(code)
    const indentChar = this.options.useTabs ? '\t' : ' '.repeat(this.options.indentSize)

    return lines.map((line) => {
      if (line.trim() === '') return ''
      return this.reindentLine(line, indentChar)
    }).join('\n')
  }

  private reindentLine(line: string, indentChar: string): string {
    let leading = ''
    let i = 0
    while (i < line.length && (line[i] === ' ' || line[i] === '\t')) {
      leading += line[i]
      i++
    }

    const content = line.slice(i)
    let indentLevel = 0
    let pos = 0

    while (pos < leading.length) {
      if (leading[pos] === '\t') {
        indentLevel++
        pos++
      } else if (leading.slice(pos, pos + 2) === '  ') {
        indentLevel++
        pos += 2
      } else if (leading.slice(pos, pos + 4) === '    ') {
        indentLevel++
        pos += 4
      } else {
        pos++
      }
    }

    return indentChar.repeat(indentLevel) + content
  }

  private normalizeLineIndent(line: string): string {
    return this.reindentLine(line, this.options.useTabs ? '\t' : ' '.repeat(this.options.indentSize))
  }

  private enforceSemicolonsInternal(code: string): string {
    if (!this.options.semicolons) return code
    return this.addSemicolons(code)
  }

  private addSemicolons(code: string): string {
    const lines = this.splitLines(code)
    const statementEnders = /^(?:export\s+)?(?:const|let|var|return|throw|break|continue|yield|import)\b/
    const blockClosers = /^[}\])]\s*$/

    return lines.map((line) => {
      const trimmed = line.trim()
      if (trimmed === '') return line
      if (trimmed.endsWith(';')) return line
      if (trimmed.endsWith(',') || trimmed.endsWith('.')) return line
      if (trimmed.endsWith(':') || trimmed.endsWith('?')) return line
      if (trimmed.endsWith('{') || trimmed.endsWith('(') || trimmed.endsWith('[')) return line
      if (trimmed.endsWith('`')) return line
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return line
      if (trimmed.endsWith('}')) return line
      if (blockClosers.test(trimmed)) return line
      if (statementEnders.test(trimmed)) {
        const insertPos = line.lastIndexOf(trimmed) + trimmed.length
        return line.slice(0, insertPos) + ';' + line.slice(insertPos)
      }
      return line
    }).join('\n')
  }

  private convertQuotes(code: string, single: boolean): string {
    let result = ''
    let i = 0

    while (i < code.length) {
      const ch = code[i]

      if (ch === '`') {
        const start = i
        i++
        while (i < code.length) {
          if (code[i] === '\\' && i + 1 < code.length) {
            i += 2
            continue
          }
          if (code[i] === '`') {
            i++
            break
          }
          i++
        }
        result += code.slice(start, i)
        continue
      }

      if ((ch === '"' && single) || (ch === "'" && !single)) {
        const opener = ch
        const closer = single ? "'" : '"'
        i++

        let body = ''
        while (i < code.length && code[i] !== opener) {
          if (code[i] === '\\' && i + 1 < code.length) {
            body += code.slice(i, i + 2)
            i += 2
            continue
          }
          body += code[i]!
          i++
        }

        if (i < code.length) { i++ }

        if (single) {
          const unescaped = body.replace(/\\(.)/g, (_, c: string) => c)
          body = unescaped.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\\\\/g, '\\')
        } else {
          const unescaped = body.replace(/\\(.)/g, (_, c: string) => c)
          body = unescaped.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\\\\/g, '\\')
        }

        result += closer + body + closer
        continue
      }

      if (ch === "'" || ch === '"') {
        const start = i
        i++
        while (i < code.length) {
          if (code[i] === '\\' && i + 1 < code.length) {
            i += 2
            continue
          }
          if (code[i] === ch) {
            i++
            break
          }
          i++
        }
        result += code.slice(start, i)
        continue
      }

      result += ch
      i++
    }

    return result
  }

  private enforceTrailingCommas(code: string): string {
    if (this.options.trailingComma === 'none') {
      return this.removeTrailingCommas(code)
    }
    return code
  }

  private removeTrailingCommas(code: string): string {
    return code.replace(/,(\s*[}\])])/g, '$1')
  }

  private formatRangeOnly(code: string): string {
    let result = code
    result = this.normalizeLineEndings(result, 'lf')
    result = this.trimTrailingWhitespace(result)
    result = this.normalizeIndentation(result)
    result = this.enforceQuotes(result, this.options.singleQuotes)
    result = this.enforceSemicolonsInternal(result)
    result = this.enforceTrailingCommas(result)
    result = this.normalizeLineEndings(result, this.options.endOfLine)
    return result
  }

  private splitLines(code: string): string[] {
    return code.split('\n')
  }
}

export type { FormatOptions, FormatResult, FormatRange, FormatError, ChangeDescription } from './types.js'
export { DEFAULT_FORMAT_OPTIONS } from './types.js'
