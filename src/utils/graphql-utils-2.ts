export class GraphQLUtils2 {
  static buildQuery(operation: string, fields: string[], args?: Record<string, unknown>): string {
    let query = `{ ${operation}`
    if (args) {
      const argStr = Object.entries(args)
        .map(([k, v]) => `${k}: ${GraphQLUtils2.formatValue(v)}`)
        .join(', ')
      query += `(${argStr})`
    }
    query += ` { ${fields.join(' ')} } }`
    return query
  }

  static buildMutation(operation: string, fields: string[], args?: Record<string, unknown>): string {
    return `mutation ${GraphQLUtils2.buildQuery(operation, fields, args).replace('{', '{').trim()}`
  }

  static formatValue(value: unknown): string {
    if (value === null) return 'null'
    if (typeof value === 'string') return `"${value}"`
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (Array.isArray(value)) return `[${value.map(v => GraphQLUtils2.formatValue(v)).join(', ')}]`
    if (typeof value === 'object') {
      const fields = Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${GraphQLUtils2.formatValue(v)}`)
        .join(', ')
      return `{ ${fields} }`
    }
    return String(value)
  }

  static parseFields(selectionSet: string): string[] {
    const trimmed = selectionSet.trim().replace(/^\{/, '').replace(/\}$/, '').trim()
    if (!trimmed) return []
    const fields: string[] = []
    let depth = 0
    let current = ''
    for (const ch of trimmed) {
      if (ch === '{') depth++
      if (ch === '}') depth--
      if (depth === 0 && ch === ' ') {
        if (current.trim()) fields.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    if (current.trim()) fields.push(current.trim())
    return fields
  }

  static extractOperation(query: string): { operation: string; name: string } | null {
    const match = query.match(/^\s*(query|mutation|subscription)\s+(\w+)/i)
    if (!match) return null
    return { operation: match[1].toLowerCase(), name: match[2] }
  }

  static stripFragments(query: string): string {
    return query.replace(/\.\.\.\w+/g, '').replace(/\s+/g, ' ').trim()
  }

  static validateFieldName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
  }

  static extractVariables(query: string): string[] {
    const match = query.match(/\$\w+/g)
    return match ? match.map(v => v.substring(1)) : []
  }

  static minify(query: string): string {
    return query.replace(/\s+/g, ' ').replace(/\s*([{}()])/g, '$1').replace(/([{}()])\s*/g, '$1').trim()
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): GraphQLUtils2 { return new GraphQLUtils2() }
  equals(other: unknown): boolean { return other instanceof GraphQLUtils2 }
}
