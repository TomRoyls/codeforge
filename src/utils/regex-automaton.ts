export class RegexAutomaton {
  private patterns: Array<{ regex: RegExp; name: string }> = []

  add(name: string, pattern: string): void {
    this.patterns.push({ regex: new RegExp(pattern), name })
  }

  match(input: string): Array<{ name: string; match: string; index: number }> {
    const results: Array<{ name: string; match: string; index: number }> = []
    for (const { regex, name } of this.patterns) {
      let m: RegExpExecArray | null
      const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g')
      while ((m = re.exec(input)) !== null) {
        results.push({ name, match: m[0], index: m.index })
      }
    }
    return results.sort((a, b) => a.index - b.index)
  }

  matchFirst(input: string): { name: string; match: string; index: number } | undefined {
    const results = this.match(input)
    return results[0]
  }

  test(input: string): boolean {
    return this.match(input).length > 0
  }

  get count(): number {
    return this.patterns.length
  }

  get isEmpty(): boolean {
    return this.patterns.length === 0
  }

  remove(name: string): boolean {
    const idx = this.patterns.findIndex((p) => p.name === name)
    if (idx < 0) return false
    this.patterns.splice(idx, 1)
    return true
  }

  clear(): void {
    this.patterns = []
  }

  toArray(): Array<{ name: string; pattern: string }> {
    return this.patterns.map((p) => ({ name: p.name, pattern: p.regex.source }))
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): Array<{ name: string; pattern: string }> {
    return this.toArray()
  }

  clone(): RegexAutomaton {
    const copy = new RegexAutomaton()
    for (const { name, regex } of this.patterns) {
      copy.patterns.push({ regex: new RegExp(regex.source, regex.flags), name })
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RegexAutomaton)) return false
    return this.count === other.count
  }
}
