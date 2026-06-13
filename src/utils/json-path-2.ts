export class JsonPath2 {
  private cache: Map<string, (obj: unknown) => unknown[]> = new Map()

  get(obj: unknown, path: string): unknown {
    const result = this.getArray(obj, path)
    return result.length > 0 ? result[0] : undefined
  }

  getArray(obj: unknown, path: string): unknown[] {
    const fn = this.compile(path)
    return fn(obj) as unknown[]
  }

  set(obj: Record<string, unknown>, path: string, value: unknown): boolean {
    const keys = this.parsePath(path)
    if (keys.length === 0) return false

    let current: unknown = obj
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (typeof current !== 'object' || current === null) return false
      current = (current as Record<string, unknown>)[key]
    }

    if (typeof current !== 'object' || current === null) return false
    const lastKey = keys[keys.length - 1]
    ;(current as Record<string, unknown>)[lastKey] = value
    return true
  }

  has(obj: unknown, path: string): boolean {
    return this.get(obj, path) !== undefined
  }

  compile(path: string): (obj: unknown) => unknown[] {
    if (this.cache.has(path)) return this.cache.get(path)!
    const fn = this.buildEvaluator(path)
    this.cache.set(path, fn)
    return fn
  }

  private buildEvaluator(path: string): (obj: unknown) => unknown[] {
    const tokens = this.tokenize(path)
    return (root: unknown) => {
      let results: unknown[] = [root]
      for (const token of tokens) {
        const next: unknown[] = []
        if (token.startsWith('[') && token.endsWith(']')) {
          const indexStr = token.slice(1, -1)
          for (const r of results) {
            if (Array.isArray(r)) {
              if (indexStr === '*') next.push(...r)
              else {
                const idx = parseInt(indexStr, 10)
                if (r[idx] !== undefined) next.push(r[idx])
              }
            }
          }
        } else if (token === '*') {
          for (const r of results) {
            if (Array.isArray(r)) next.push(...r)
            else if (typeof r === 'object' && r !== null) next.push(...Object.values(r))
          }
        } else if (token.includes('[') && token.includes(']')) {
          const key = token.substring(0, token.indexOf('['))
          const indexStr = token.substring(token.indexOf('[') + 1, token.indexOf(']'))
          for (const r of results) {
            if (key) {
              const val = (r as Record<string, unknown>)[key]
              if (Array.isArray(val)) {
                if (indexStr === '*') next.push(...val)
                else {
                  const idx = parseInt(indexStr, 10)
                  if (val[idx] !== undefined) next.push(val[idx])
                }
              }
            }
          }
        } else {
          for (const r of results) {
            if (typeof r === 'object' && r !== null) {
              const val = (r as Record<string, unknown>)[token]
              if (val !== undefined) next.push(val)
            }
          }
        }
        results = next
      }
      return results
    }
  }

  private tokenize(path: string): string[] {
    if (path.startsWith('$')) path = path.slice(1)
    if (path.startsWith('.')) path = path.slice(1)
    if (path === '') return []

    const tokens: string[] = []
    let current = ''
    let inBracket = false

    for (const char of path) {
      if (char === '.') {
        if (!inBracket && current) {
          tokens.push(current)
          current = ''
        } else if (!inBracket) {
          continue
        } else {
          current += char
        }
      } else if (char === '[') {
        inBracket = true
        if (current) {
          tokens.push(current)
          current = ''
        }
        current = char
      } else if (char === ']') {
        inBracket = false
        current += char
        tokens.push(current)
        current = ''
      } else {
        current += char
      }
    }

    if (current) tokens.push(current)
    return tokens
  }

  private parsePath(path: string): string[] {
    const tokens = this.tokenize(path)
    return tokens.filter(t => !t.startsWith('['))
  }

  count(): number { return this.cache.size }

  toArray(): string[] { return Array.from(this.cache.keys()) }
  toString(): string { return JSON.stringify({ compiled: this.cache.size }) }
  toJSON(): Record<string, unknown> { return { compiled: this.cache.size } }
  clone(): JsonPath2 { return new JsonPath2() }
  equals(other: unknown): boolean {
    if (!(other instanceof JsonPath2)) return false
    return this.count() === other.count()
  }
  clear(): void { this.cache.clear() }
}
