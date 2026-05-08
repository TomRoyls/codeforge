import type { DecoratorInfo, DecoratorArg, DecoratorTarget } from './types.js'

const AT_IDENTIFIER = /[a-zA-Z_]\w*/g

export class DecoratorExtractor {
  extract(source: string): DecoratorInfo[] {
    const decorators: DecoratorInfo[] = []
    const lines = source.split('\n')
    let pos = 0

    while (pos < source.length) {
      const ch = source[pos]!

      if (ch === '"' || ch === "'" || ch === '`') {
        pos = this.skipStringLiteral(source, pos, ch)
        continue
      }

      if (ch === '/' && pos + 1 < source.length) {
        const next = source[pos + 1]!
        if (next === '/') {
          pos = source.indexOf('\n', pos)
          if (pos === -1) break
          continue
        }
        if (next === '*') {
          pos = source.indexOf('*/', pos + 2)
          if (pos === -1) break
          pos += 2
          continue
        }
      }

      if (ch === '@') {
        AT_IDENTIFIER.lastIndex = pos + 1
        const idMatch = AT_IDENTIFIER.exec(source)
        if (idMatch) {
          const name = idMatch[0]!
          const nameEnd = pos + 1 + name.length
          const lineInfo = this.getLineNumber(lines, pos)
          const column = pos - lineInfo.lineStart + 1

          let argsStr: string | null = null
          let argsEnd = nameEnd
          let searchPos = nameEnd
          while (searchPos < source.length && (source[searchPos] === ' ' || source[searchPos] === '\t')) {
            searchPos++
          }

          if (searchPos < source.length && source[searchPos] === '(') {
            const block = this.findDecoratorBlock(source, searchPos)
            argsStr = block.content
            argsEnd = block.endIndex
          }

          const isFactory = argsStr !== null
          const args = argsStr ? this.parseArguments(argsStr) : []
          const fullSource = source.slice(pos, argsEnd).replace(/\n/g, ' ').trim()

          const endLineIdx = this.getLineIdxAtPos(lines, argsEnd > pos ? argsEnd - 1 : pos)
          const target = this.determineTargetAtPos(lines, endLineIdx)

          decorators.push({
            name,
            args,
            target,
            isFactory,
            source: fullSource,
            line: lineInfo.line,
            column,
          })

          pos = argsEnd
          continue
        }
      }

      pos++
    }

    return decorators
  }

  extractFromClass(source: string, className: string): DecoratorInfo[] {
    const all = this.extract(source)
    const lines = source.split('\n')
    let classLineIdx = -1

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i]!.trim()
      if (/^(export\s+)?(default\s+)?(abstract\s+)?class\s+/.test(trimmed)) {
        if (trimmed.includes(className) || lines[i]!.includes(className)) {
          classLineIdx = i
          break
        }
      }
    }

    if (classLineIdx === -1) return []

    return all.filter((d) => {
      return d.line <= classLineIdx + 1 && d.line >= this.findDecoratorBlockStart(lines, classLineIdx)
    })
  }

  extractFromMethod(source: string, methodName: string): DecoratorInfo[] {
    const all = this.extract(source)
    const lines = source.split('\n')
    let methodLineIdx = -1

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i]!.trim()
      if (/^(public|private|protected|static|async|abstract|readonly|\s)*\w+\s*\(/.test(trimmed)) {
        if (trimmed.includes(methodName)) {
          methodLineIdx = i
          break
        }
      }
    }

    if (methodLineIdx === -1) return []

    return all.filter((d) => {
      return d.line <= methodLineIdx + 1 && d.line >= this.findDecoratorBlockStart(lines, methodLineIdx)
    })
  }

  extractFromProperty(source: string, propertyName: string): DecoratorInfo[] {
    const all = this.extract(source)
    const lines = source.split('\n')
    let propertyLineIdx = -1

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i]!.trim()
      if (/^(public|private|protected|static|readonly|\s)*\w+\s*[:=]/.test(trimmed)) {
        if (trimmed.includes(propertyName)) {
          propertyLineIdx = i
          break
        }
      }
    }

    if (propertyLineIdx === -1) return []

    return all.filter((d) => {
      return d.line <= propertyLineIdx + 1 && d.line >= this.findDecoratorBlockStart(lines, propertyLineIdx)
    })
  }

  parseArguments(argsStr: string): DecoratorArg[] {
    const inner = this.stripOuterParens(argsStr).trim()
    if (inner.length === 0) return []

    const tokens = this.tokenize(inner)
    const args: DecoratorArg[] = []

    for (const token of tokens) {
      args.push(this.parseToken(token.trim()))
    }

    return args
  }

  isFactoryDecorator(source: string): boolean {
    const match = source.match(/^@\w+\s*\(/)
    return match !== null
  }

  findDecoratorBlock(source: string, startIndex: number): { content: string; endIndex: number } {
    let depth = 0
    let i = startIndex
    let started = false
    let inString = false
    let stringChar = ''

    while (i < source.length) {
      const ch = source[i]!

      if (inString) {
        if (ch === stringChar && source[i - 1] !== '\\') {
          inString = false
        }
        i++
        continue
      }

      if (ch === '"' || ch === "'" || ch === '`') {
        inString = true
        stringChar = ch
        i++
        continue
      }

      if (ch === '(') {
        depth++
        started = true
      } else if (ch === ')') {
        depth--
        if (started && depth === 0) {
          return { content: source.slice(startIndex, i + 1), endIndex: i + 1 }
        }
      }
      i++
    }

    return { content: source.slice(startIndex), endIndex: source.length }
  }

  private skipStringLiteral(source: string, start: number, quote: string): number {
    let i = start + 1
    while (i < source.length) {
      const ch = source[i]!
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === quote) {
        return i + 1
      }
      i++
    }
    return source.length
  }

  private getLineNumber(lines: string[], pos: number): { line: number; lineIdx: number; lineStart: number } {
    let offset = 0
    for (let i = 0; i < lines.length; i++) {
      const lineLen = lines[i]!.length + 1
      if (offset + lineLen > pos) {
        return { line: i + 1, lineIdx: i, lineStart: offset }
      }
      offset += lineLen
    }
    return { line: lines.length, lineIdx: lines.length - 1, lineStart: offset }
  }

  private getLineIdxAtPos(lines: string[], pos: number): number {
    let offset = 0
    for (let i = 0; i < lines.length; i++) {
      const lineLen = lines[i]!.length + 1
      if (offset + lineLen > pos) {
        return i
      }
      offset += lineLen
    }
    return lines.length - 1
  }

  private determineTargetAtPos(lines: string[], decoratorLineIdx: number): DecoratorTarget {
    for (let i = decoratorLineIdx + 1; i < Math.min(lines.length, decoratorLineIdx + 10); i++) {
      const nextLine = lines[i]?.trim() ?? ''
      if (nextLine === '' || nextLine.startsWith('@')) continue

      if (/^(export\s+)?(default\s+)?(abstract\s+)?class\s+/.test(nextLine)) {
        return 'class'
      }
      if (/^(public|private|protected|static|async|abstract|readonly|\s)*(get|set)\s+\w+/.test(nextLine)) {
        return 'accessor'
      }
      if (/^(public|private|protected|static|async|\s)*\w+\s*\(/.test(nextLine)) {
        return 'method'
      }
      if (/^\w+\s*[:=]/.test(nextLine) || /^(public|private|protected|static|readonly)\s+\w+/.test(nextLine)) {
        return 'property'
      }
    }

    return 'class'
  }

  private findDecoratorBlockStart(lines: string[], targetLineIdx: number): number {
    let start = targetLineIdx
    while (start > 0) {
      const prevLine = lines[start - 1]!.trim()
      if (prevLine.startsWith('@') || prevLine === '') {
        start--
      } else {
        break
      }
    }
    return start + 1
  }

  private stripOuterParens(s: string): string {
    if (s.startsWith('(') && s.endsWith(')')) {
      return s.slice(1, -1)
    }
    return s
  }

  private tokenize(inner: string): string[] {
    const tokens: string[] = []
    let depth = 0
    let current = ''
    let inString = false
    let stringChar = ''

    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i]!

      if (inString) {
        current += ch
        if (ch === stringChar && inner[i - 1] !== '\\') {
          inString = false
        }
        continue
      }

      if (ch === '"' || ch === "'" || ch === '`') {
        inString = true
        stringChar = ch
        current += ch
        continue
      }

      if (ch === '(' || ch === '[' || ch === '{') {
        depth++
        current += ch
        continue
      }

      if (ch === ')' || ch === ']' || ch === '}') {
        depth--
        current += ch
        continue
      }

      if (ch === ',' && depth === 0) {
        if (current.trim()) tokens.push(current)
        current = ''
        continue
      }

      current += ch
    }

    if (current.trim()) tokens.push(current)
    return tokens
  }

  private parseToken(token: string): DecoratorArg {
    const trimmed = token.trim()

    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('`') && trimmed.endsWith('`'))) {
      return { kind: 'string', value: trimmed.slice(1, -1) }
    }

    if (trimmed === 'true') return { kind: 'boolean', value: true }
    if (trimmed === 'false') return { kind: 'boolean', value: false }

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return { kind: 'number', value: Number(trimmed) }
    }

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return { kind: 'object', value: this.parseObjectLiteral(trimmed) }
    }

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return { kind: 'array', value: this.parseArrayLiteral(trimmed) }
    }

    return { kind: 'identifier', value: trimmed }
  }

  private parseObjectLiteral(s: string): Record<string, unknown> {
    const inner = s.slice(1, -1).trim()
    if (inner.length === 0) return {}

    const result: Record<string, unknown> = {}
    const tokens = this.tokenize(inner)

    for (const token of tokens) {
      const colonIdx = token.indexOf(':')
      if (colonIdx === -1) continue
      const key = token.slice(0, colonIdx).trim().replace(/^['"]|['"]$/g, '')
      const val = token.slice(colonIdx + 1).trim()
      result[key] = this.parsePrimitiveValue(val)
    }

    return result
  }

  private parseArrayLiteral(s: string): unknown[] {
    const inner = s.slice(1, -1).trim()
    if (inner.length === 0) return []

    const tokens = this.tokenize(inner)
    return tokens.map((t) => {
      const parsed = this.parseToken(t.trim())
      return parsed.value
    })
  }

  private parsePrimitiveValue(val: string): unknown {
    const trimmed = val.trim()
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1)
    }
    if (trimmed === 'true') return true
    if (trimmed === 'false') return false
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed)
    return trimmed
  }
}

export function findAllDecoratorNames(source: string): string[] {
  const names: string[] = []
  const extractor = new DecoratorExtractor()
  const decorators = extractor.extract(source)
  for (const d of decorators) {
    names.push(d.name)
  }
  return names
}
