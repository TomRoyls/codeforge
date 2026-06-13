export interface RouteParams {
  [key: string]: string
}

export class RouteMatcher2 {
  private patterns: { pattern: RegExp; paramNames: string[]; original: string }[] = []

  add(pattern: string): void {
    const paramNames: string[] = []
    let regexStr = pattern
      .replace(/\/$/, '')
      .replace(/[.+*?^${}()|[\]\\]/g, '\\$&')
    regexStr = regexStr.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
      paramNames.push(name)
      return '([^/]+)'
    })
    regexStr = regexStr.replace(/\\\*([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
      paramNames.push(name)
      return '(.*)'
    })
    regexStr = regexStr.replace(/\\\*/g, () => {
      paramNames.push('_wild')
      return '(.*)'
    })
    this.patterns.push({ pattern: new RegExp(`^${regexStr}$`), paramNames, original: pattern })
  }

  match(path: string): { route: string; params: RouteParams } | null {
    const cleanPath = path.replace(/\/$/, '') || '/'
    for (const { pattern, paramNames, original } of this.patterns) {
      const match = pattern.exec(cleanPath)
      if (match) {
        const params: RouteParams = {}
        paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1])
        })
        return { route: original, params }
      }
    }
    return null
  }

  matchAll(path: string): { route: string; params: RouteParams }[] {
    const results: { route: string; params: RouteParams }[] = []
    const cleanPath = path.replace(/\/$/, '') || '/'
    for (const { pattern, paramNames, original } of this.patterns) {
      const match = pattern.exec(cleanPath)
      if (match) {
        const params: RouteParams = {}
        paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1])
        })
        results.push({ route: original, params })
      }
    }
    return results
  }

  remove(pattern: string): boolean {
    const idx = this.patterns.findIndex(p => p.original === pattern)
    if (idx !== -1) {
      this.patterns.splice(idx, 1)
      return true
    }
    return false
  }

  clear(): void {
    this.patterns = []
  }

  size(): number {
    return this.patterns.length
  }

  static buildPath(pattern: string, params: RouteParams): string {
    let result = pattern
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`:${key}`, encodeURIComponent(value))
      result = result.replace(`*${key}`, encodeURIComponent(value))
    }
    return result
  }

  toArray(): string[] { return this.patterns.map(p => p.original) }
  toString(): string { return JSON.stringify(this.toArray()) }
  toJSON(): string[] { return this.toArray() }
  clone(): RouteMatcher2 {
    const r = new RouteMatcher2()
    this.patterns.forEach(p => r.add(p.original))
    return r
  }
  equals(other: unknown): boolean {
    if (!(other instanceof RouteMatcher2)) return false
    if (this.size() !== other.size()) return false
    return this.toArray().every(r => other.toArray().includes(r))
  }
}
