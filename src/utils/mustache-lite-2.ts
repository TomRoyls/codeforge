export class MustacheLite2 {
  render(template: string, data: Record<string, unknown>): string {
    let result = template

    result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, content) => {
      const value = data[key]
      if (Array.isArray(value)) {
        return value.map(item => {
          if (typeof item === 'object' && item !== null) {
            return new MustacheLite2().render(content, item as Record<string, unknown>)
          }
          return content.replace(/\{\{\.\}\}/g, String(item))
        }).join('')
      }
      if (typeof value === 'object' && value !== null) {
        return new MustacheLite2().render(content, { ...data, ...(value as Record<string, unknown>) })
      }
      return value ? content : ''
    })

    result = result.replace(/\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, content) => {
      const value = data[key]
      return (!value || (Array.isArray(value) && value.length === 0)) ? content : ''
    })

    result = result.replace(/\{\{&(\w+)\}\}/g, (_, key) => {
      const value = data[key]
      return value !== undefined ? String(value) : ''
    })

    result = result.replace(/\{\{\{(\w+)\}\}\}/g, (_, key) => {
      const value = data[key]
      return value !== undefined ? String(value) : ''
    })

    result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const value = data[key]
      if (value === undefined || value === null) return ''
      return MustacheLite2.escape(String(value))
    })

    return result
  }

  static escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  static extractNames(template: string): string[] {
    const names = new Set<string>()
    const regex = /\{\{[#^/&]?\s*(\w+)\s*\}\}/g
    let match
    while ((match = regex.exec(template)) !== null) {
      if (match[1] !== 'else') names.add(match[1])
    }
    return Array.from(names)
  }

  static tokenize(template: string): { type: 'text' | 'tag'; value: string }[] {
    const tokens: { type: 'text' | 'tag'; value: string }[] = []
    const regex = /(\{\{[#^/&]?\s*\w+\s*\}\})/g
    let lastIdx = 0
    let match
    while ((match = regex.exec(template)) !== null) {
      if (match.index > lastIdx) {
        tokens.push({ type: 'text', value: template.substring(lastIdx, match.index) })
      }
      tokens.push({ type: 'tag', value: match[1] })
      lastIdx = match.index + match[0].length
    }
    if (lastIdx < template.length) {
      tokens.push({ type: 'text', value: template.substring(lastIdx) })
    }
    return tokens
  }

  static compile(template: string): (data: Record<string, unknown>) => string {
    return (data: Record<string, unknown>) => new MustacheLite2().render(template, data)
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): MustacheLite2 { return new MustacheLite2() }
  equals(other: unknown): boolean { return other instanceof MustacheLite2 }
}
