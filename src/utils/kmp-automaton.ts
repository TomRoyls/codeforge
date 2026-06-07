export class KMPAutomaton {
  private pattern: string
  private fail: number[]

  constructor(pattern: string) {
    this.pattern = pattern
    const m = pattern.length
    this.fail = new Array(m + 1).fill(0)
    this.fail[0] = -1
    let k = -1
    for (let i = 1; i <= m; i++) {
      while (k >= 0 && pattern[k] !== pattern[i - 1]) k = this.fail[k]!
      k++
      this.fail[i] = k
    }
  }

  search(text: string): number[] {
    const result: number[] = []
    const n = text.length
    const m = this.pattern.length
    if (m === 0) return result
    let k = 0
    for (let i = 0; i < n; i++) {
      while (k >= 0 && this.pattern[k] !== text[i]) k = this.fail[k]!
      k++
      if (k === m) {
        result.push(i - m + 1)
        k = this.fail[k]!
      }
    }
    return result
  }

  getFailure(): number[] {
    return [...this.fail]
  }

  toString(): string {
    return `KMPAutomaton("${this.pattern}")`
  }

  toJSON(): unknown {
    return { pattern: this.pattern, fail: this.fail }
  }

  clone(): KMPAutomaton {
    return new KMPAutomaton(this.pattern)
  }

  equals(other: unknown): boolean {
    if (!(other instanceof KMPAutomaton)) return false
    if (this.pattern !== other.pattern) return false
    if (this.fail.length !== other.fail.length) return false
    for (let i = 0; i < this.fail.length; i++) {
      if (this.fail[i] !== other.fail[i]) return false
    }
    return true
  }
}
