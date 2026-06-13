export interface GlobMatch {
  path: string
  matched: boolean
  pattern: string
}

export class GlobMatcher2 {
  private patterns: Map<string, RegExp> = new Map()
  private negations: Set<string> = new Set()

  add(pattern: string): this {
    const neg = pattern.startsWith('!')
    if (neg) {
      const clean = pattern.slice(1)
      this.negations.add(clean)
      this.patterns.set(clean, this.compile(clean))
    } else {
      this.patterns.set(pattern, this.compile(pattern))
    }
    return this
  }

  remove(pattern: string): boolean {
    this.negations.delete(pattern)
    return this.patterns.delete(pattern)
  }

  has(pattern: string): boolean {
    return this.patterns.has(pattern)
  }

  match(path: string): boolean {
    let matched = false
    let negated = false

    for (const [pattern, regex] of this.patterns) {
      if (regex.test(path)) {
        if (this.negations.has(pattern)) {
          negated = true
        } else {
          matched = true
        }
      }
    }

    if (negated) return false
    return matched
  }

  matchDetail(path: string): GlobMatch[] {
    const results: GlobMatch[] = []
    for (const [pattern, regex] of this.patterns) {
      results.push({
        path,
        matched: regex.test(path),
        pattern,
      })
    }
    return results
  }

  filter(paths: string[]): string[] {
    return paths.filter(p => this.match(p))
  }

  getPatterns(): string[] {
    return Array.from(this.patterns.keys())
  }

  count(): number { return this.patterns.size }

  private compile(pattern: string): RegExp {
    let result = ''
    let i = 0
    while (i < pattern.length) {
      const char = pattern[i]
      if (char === '*') {
        if (pattern[i + 1] === '*') {
          result += '.*'
          i += 2
          if (pattern[i] === '/') i++
        } else {
          result += '[^/]*'
          i++
        }
      } else if (char === '?') {
        result += '[^/]'
        i++
      } else if (char === '{') {
        const close = pattern.indexOf('}', i)
        if (close !== -1) {
          const options = pattern.slice(i + 1, close)
          result += `(${options.split(',').join('|')})`
          i = close + 1
        } else {
          result += '\\{'
          i++
        }
      } else if (char === '[') {
        const close = pattern.indexOf(']', i)
        if (close !== -1) {
          result += pattern.slice(i, close + 1)
          i = close + 1
        } else {
          result += '\\['
          i++
        }
      } else if ('.+^$()|\\'.includes(char)) {
        result += '\\' + char
        i++
      } else {
        result += char
        i++
      }
    }
    return new RegExp(`^${result}$`)
  }

  toArray(): string[] { return this.getPatterns() }
  toString(): string { return JSON.stringify({ patterns: this.count() }) }
  toJSON(): Record<string, unknown> { return { patterns: this.getPatterns() } }
  clone(): GlobMatcher2 {
    const gm = new GlobMatcher2()
    this.patterns.forEach((re, p) => {
      gm.patterns.set(p, re)
      if (this.negations.has(p)) gm.negations.add(p)
    })
    return gm
  }
  equals(other: unknown): boolean {
    if (!(other instanceof GlobMatcher2)) return false
    return this.count() === other.count()
  }
  clear(): void { this.patterns.clear(); this.negations.clear() }
}
