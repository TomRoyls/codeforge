export class TemplateRenderer2 {
  private delimiters: { open: string; close: string } = { open: '{{', close: '}}' }

  setDelimiters(open: string, close: string): this {
    this.delimiters = { open, close }
    return this
  }

  render(template: string, data: Record<string, unknown>): string {
    const { open, close } = this.delimiters
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const varRegex = new RegExp(`${escapeRegex(open)}\\s*(\\w+(?:\\.\\w+)*)\\s*${escapeRegex(close)}`, 'g')
    const condRegex = new RegExp(`${escapeRegex(open)}(#|\\^)(\\w+)${escapeRegex(close)}([\\s\\S]*?)${escapeRegex(open)}/\\2${escapeRegex(close)}`, 'g')

    let result = template.replace(condRegex, (_, mode, key, content) => {
      const value = TemplateRenderer2.resolvePath(data, key)
      if (mode === '#') {
        return value ? content : ''
      } else {
        return value ? '' : content
      }
    })

    result = result.replace(varRegex, (_, path) => {
      const value = TemplateRenderer2.resolvePath(data, path)
      return value !== undefined && value !== null ? String(value) : ''
    })

    return result
  }

  renderStrict(template: string, data: Record<string, unknown>): string {
    const { open, close } = this.delimiters
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const varRegex = new RegExp(`${escapeRegex(open)}\\s*(\\w+(?:\\.\\w+)*)\\s*${escapeRegex(close)}`, 'g')

    return template.replace(varRegex, (_, path) => {
      const value = TemplateRenderer2.resolvePath(data, path)
      if (value === undefined) throw new Error(`Missing key: ${path}`)
      return String(value)
    })
  }

  private static resolvePath(data: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.')
    let current: unknown = data
    for (const part of parts) {
      if (current === null || current === undefined) return undefined
      current = (current as Record<string, unknown>)[part]
    }
    return current
  }

  static extractVariables(template: string, open = '{{', close = '}}'): string[] {
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`${escapeRegex(open)}\\s*(\\w+(?:\\.\\w+)*)\\s*${escapeRegex(close)}`, 'g')
    const matches = template.match(regex) || []
    return matches.map(m => m.replace(new RegExp(`${escapeRegex(open)}|${escapeRegex(close)}`, 'g'), '').trim())
  }

  static escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  static renderPartial(template: string, partials: Record<string, string>, data: Record<string, unknown>): string {
    const result = template.replace(/\{\{>\s*(\w+)\s*\}\}/g, (_, name) => {
      const partial = partials[name]
      if (!partial) return ''
      return TemplateRenderer2.renderPartial(partial, partials, data)
    })
    const renderer = new TemplateRenderer2()
    return renderer.render(result, data)
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): TemplateRenderer2 { return new TemplateRenderer2() }
  equals(other: unknown): boolean { return other instanceof TemplateRenderer2 }
}
