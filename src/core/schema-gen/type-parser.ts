import type { TypeInfo, PropertySchema } from './types.js'

const PRIMITIVES = new Set([
  'string',
  'number',
  'boolean',
  'null',
  'undefined',
  'void',
  'never',
  'any',
  'unknown',
  'bigint',
  'symbol',
  'object',
])

export class TypeParser {
  parseType(typeStr: string): TypeInfo {
    const trimmed = typeStr.trim()
    return this.doParse(trimmed)
  }

  parsePrimitive(typeStr: string): TypeInfo | null {
    const trimmed = typeStr.trim()
    if (!this.isPrimitive(trimmed)) return null
    return {
      name: trimmed,
      kind: 'primitive',
      nullable: false,
      optional: false,
    }
  }

  parseArray(typeStr: string): TypeInfo | null {
    const trimmed = typeStr.trim()
    if (trimmed.endsWith('[]')) {
      const inner = trimmed.slice(0, -2).trim()
      if (inner.length === 0) return null
      const itemType = this.doParse(inner)
      return {
        name: trimmed,
        kind: 'array',
        items: itemType,
        nullable: false,
        optional: false,
      }
    }
    const arrayMatch = trimmed.match(/^Array<(.+)>$/s)
    if (arrayMatch) {
      const inner = arrayMatch[1]!.trim()
      const itemType = this.doParse(inner)
      return {
        name: trimmed,
        kind: 'array',
        items: itemType,
        nullable: false,
        optional: false,
      }
    }
    return null
  }

  parseObject(source: string): Map<string, PropertySchema> {
    const properties = new Map<string, PropertySchema>()
    const trimmed = source.trim()
    let content = trimmed
    if (content.startsWith('{')) content = content.slice(1)
    if (content.endsWith('}')) content = content.slice(0, -1)
    content = content.trim()
    if (content.length === 0) return properties
    const parts = this.splitTopLevel(content, ';')
    for (const part of parts) {
      const propPart = part.trim()
      if (propPart.length === 0) continue
      const prop = this.parseProperty(propPart)
      if (prop) {
        properties.set(prop.name, prop)
      }
    }
    return properties
  }

  parseUnion(types: string[]): TypeInfo {
    const parsed = types.map((t) => this.doParse(t.trim()))
    const hasNull = parsed.some((t) => t.kind === 'primitive' && (t.name === 'null' || t.name === 'undefined'))
    const nonNull = parsed.filter((t) => !(t.kind === 'primitive' && (t.name === 'null' || t.name === 'undefined')))
    if (hasNull && nonNull.length === 1) {
      const result = { ...nonNull[0]!, nullable: true }
      return result
    }
    return {
      name: types.join(' | '),
      kind: 'union',
      types: nonNull,
      nullable: hasNull,
      optional: false,
    }
  }

  parseEnum(values: string[]): TypeInfo {
    const enumValues: (string | number | boolean)[] = values.map((v) => {
      const trimmed = v.trim()
      if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1)
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1)
      if (trimmed === 'true') return true
      if (trimmed === 'false') return false
      const num = Number(trimmed)
      if (!isNaN(num)) return num
      return trimmed
    })
    return {
      name: values.join(' | '),
      kind: 'enum',
      enumValues,
      nullable: false,
      optional: false,
    }
  }

  parseTuple(types: string[]): TypeInfo {
    const parsed = types.map((t) => this.doParse(t.trim()))
    return {
      name: `[${types.join(', ')}]`,
      kind: 'tuple',
      types: parsed,
      nullable: false,
      optional: false,
    }
  }

  isPrimitive(typeStr: string): boolean {
    const trimmed = typeStr.trim()
    return PRIMITIVES.has(trimmed)
  }

  isNullable(typeStr: string): boolean {
    const trimmed = typeStr.trim()
    if (trimmed.includes('|')) {
      const parts = this.splitTopLevel(trimmed, '|')
      return parts.some((p) => p.trim() === 'null' || p.trim() === 'undefined')
    }
    return false
  }

  private doParse(typeStr: string): TypeInfo {
    const trimmed = typeStr.trim()
    if (trimmed.length === 0) {
      return { name: 'unknown', kind: 'primitive', nullable: false, optional: false }
    }
    if ((trimmed.startsWith("'") && trimmed.endsWith("'") && !trimmed.slice(1, -1).includes("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"') && !trimmed.slice(1, -1).includes('"'))) {
      return {
        name: trimmed,
        kind: 'literal',
        nullable: false,
        optional: false,
        literalValue: trimmed.slice(1, -1),
      }
    }
    if (trimmed === 'true' || trimmed === 'false') {
      return {
        name: trimmed,
        kind: 'literal',
        nullable: false,
        optional: false,
        literalValue: trimmed === 'true',
      }
    }
    const numVal = Number(trimmed)
    if (!isNaN(numVal) && trimmed !== '') {
      return {
        name: trimmed,
        kind: 'literal',
        nullable: false,
        optional: false,
        literalValue: numVal,
      }
    }
    if (this.isPrimitive(trimmed)) {
      return this.parsePrimitive(trimmed) ?? { name: trimmed, kind: 'primitive', nullable: false, optional: false }
    }
    const recordMatch = trimmed.match(/^Record<(.+),\s*(.+)>$/s)
    if (recordMatch) {
      const keyStr = recordMatch[1]!.trim()
      const valueStr = recordMatch[2]!.trim()
      return {
        name: trimmed,
        kind: 'record',
        keyType: this.doParse(keyStr),
        valueType: this.doParse(valueStr),
        nullable: false,
        optional: false,
      }
    }
    const arrayResult = this.parseArray(trimmed)
    if (arrayResult) return arrayResult
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const inner = trimmed.slice(1, -1).trim()
      if (inner.length === 0) {
        return { name: trimmed, kind: 'tuple', types: [], nullable: false, optional: false }
      }
      const parts = this.splitTopLevel(inner, ',')
      if (parts.some((p) => p.includes('...'))) {
        return this.doParse(parts[0]!.replace('...', '').trim())
      }
      return this.parseTuple(parts)
    }
    const topLevelAnd = this.splitTopLevel(trimmed, '&')
    if (topLevelAnd.length > 1 && topLevelAnd.some((p) => p.trim().startsWith('{'))) {
      return {
        name: trimmed,
        kind: 'intersection',
        types: topLevelAnd.map((p) => this.doParse(p.trim())),
        nullable: false,
        optional: false,
      }
    }
    const topLevelOr = this.splitTopLevel(trimmed, '|')
    if (topLevelOr.length > 1) {
      return this.parseUnion(topLevelOr)
    }
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const properties = this.parseObject(trimmed)
      return {
        name: 'object',
        kind: 'object',
        properties,
        nullable: false,
        optional: false,
      }
    }
    if (trimmed.includes('|') && !trimmed.startsWith('{')) {
      const parts = this.splitTopLevel(trimmed, '|')
      if (parts.length > 1) {
        return this.parseUnion(parts)
      }
    }
    if (trimmed.includes('&')) {
      const parts = this.splitTopLevel(trimmed, '&')
      if (parts.length > 1) {
        return {
          name: trimmed,
          kind: 'intersection',
          types: parts.map((p) => this.doParse(p.trim())),
          nullable: false,
          optional: false,
        }
      }
    }
    return {
      name: trimmed,
      kind: 'ref',
      nullable: false,
      optional: false,
    }
  }

  private parseProperty(propStr: string): PropertySchema | null {
    let remaining = propStr.trim()
    let description: string | undefined
    let defaultValue: unknown
    const commentMatch = remaining.match(/\/\/(.+)$/)
    if (commentMatch) {
      description = commentMatch[1]!.trim()
      remaining = remaining.slice(0, commentMatch.index).trim()
    }
    const defaultMatch = remaining.match(/=\s*(.+)$/)
    if (defaultMatch) {
      const defaultStr = defaultMatch[1]!.trim()
      defaultValue = this.parseDefaultValue(defaultStr)
      remaining = remaining.slice(0, defaultMatch.index!).trim()
    }
    const colonIdx = remaining.indexOf(':')
    if (colonIdx === -1) {
      const name = remaining.replace(/[?]/g, '').trim()
      if (name.length === 0) return null
      const optional = remaining.includes('?')
      return {
        name,
        type: { name: 'unknown', kind: 'primitive', nullable: false, optional: false },
        required: !optional,
        description,
        defaultValue,
      }
    }
    let namePart = remaining.slice(0, colonIdx).trim()
    const optional = namePart.endsWith('?')
    if (optional) namePart = namePart.slice(0, -1).trim()
    if (namePart.startsWith('readonly ')) namePart = namePart.slice('readonly '.length).trim()
    const name = namePart
    if (name.length === 0) return null
    const typeStr = remaining.slice(colonIdx + 1).trim()
    const type = this.doParse(typeStr)
    return {
      name,
      type,
      required: !optional,
      description,
      defaultValue,
    }
  }

  private parseDefaultValue(valueStr: string): unknown {
    const trimmed = valueStr.trim()
    if (trimmed === 'true') return true
    if (trimmed === 'false') return false
    if (trimmed === 'null') return null
    if (trimmed === 'undefined') return undefined
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1)
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1)
    const num = Number(trimmed)
    if (!isNaN(num)) return num
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return JSON.parse(trimmed.replace(/'/g, '"'))
      } catch {
        return trimmed
      }
    }
    return trimmed
  }

  private splitTopLevel(input: string, delimiter: string): string[] {
    const parts: string[] = []
    let depth = 0
    let angleDepth = 0
    let current = ''
    let inString: string | null = null
    for (let i = 0; i < input.length; i++) {
      const ch = input[i]!
      if (inString) {
        current += ch
        if (ch === inString) inString = null
        continue
      }
      if (ch === "'" || ch === '"') {
        inString = ch
        current += ch
        continue
      }
      if (ch === '{' || ch === '(' || ch === '[') {
        depth++
        current += ch
        continue
      }
      if (ch === '}' || ch === ')' || ch === ']') {
        depth--
        current += ch
        continue
      }
      if (ch === '<') {
        angleDepth++
        current += ch
        continue
      }
      if (ch === '>') {
        angleDepth--
        current += ch
        continue
      }
      if (depth === 0 && angleDepth === 0 && ch === delimiter) {
        parts.push(current)
        current = ''
        continue
      }
      current += ch
    }
    if (current.length > 0) {
      parts.push(current)
    }
    return parts
  }
}
