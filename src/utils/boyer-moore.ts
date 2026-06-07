export class BoyerMoore {
  private readonly pattern: string
  private readonly patternLen: number
  private readonly badChar: Map<string, number>
  private readonly goodSuffix: number[]
  private readonly caseSensitive: boolean

  constructor(pattern: string, options?: { caseSensitive?: boolean }) {
    this.caseSensitive = options?.caseSensitive ?? true
    this.pattern = this.caseSensitive ? pattern : pattern.toLowerCase()
    this.patternLen = this.pattern.length
    this.badChar = this.buildBadCharTable()
    this.goodSuffix = this.buildGoodSuffixTable()
  }

  search(text: string): number[] {
    if (this.patternLen === 0 || text.length < this.patternLen) return []
    const t = this.caseSensitive ? text : text.toLowerCase()
    const result: number[] = []
    let i = 0

    while (i <= t.length - this.patternLen) {
      let j = this.patternLen - 1
      while (j >= 0 && this.pattern[j] === t[i + j]) {
        j--
      }
      if (j < 0) {
        result.push(i)
        const shift = this.goodSuffix[0]!
        i += shift === 0 ? 1 : shift
      } else {
        const badCharShift = j - (this.badChar.get(t[i + j]!) ?? -1)
        const goodSuffixShift = this.goodSuffix[j]!
        i += Math.max(1, badCharShift, goodSuffixShift)
      }
    }
    return result
  }

  searchFirst(text: string): number {
    if (this.patternLen === 0 || text.length < this.patternLen) return -1
    const t = this.caseSensitive ? text : text.toLowerCase()
    let i = 0

    while (i <= t.length - this.patternLen) {
      let j = this.patternLen - 1
      while (j >= 0 && this.pattern[j] === t[i + j]) {
        j--
      }
      if (j < 0) return i
      const badCharShift = j - (this.badChar.get(t[i + j]!) ?? -1)
      const goodSuffixShift = this.goodSuffix[j]!
      i += Math.max(1, badCharShift, goodSuffixShift)
    }
    return -1
  }

  contains(text: string): boolean {
    return this.searchFirst(text) >= 0
  }

  count(text: string): number {
    return this.search(text).length
  }

  private buildBadCharTable(): Map<string, number> {
    const table = new Map<string, number>()
    for (let i = 0; i < this.patternLen; i++) {
      table.set(this.pattern[i]!, i)
    }
    return table
  }

  private buildGoodSuffixTable(): number[] {
    const n = this.patternLen
    const table = new Array(n + 1).fill(0)

    const suffix = new Array(n + 1).fill(0)
    suffix[n - 1] = n
    let g = n - 1
    let f = 0

    for (let i = n - 2; i >= 0; i--) {
      if (i > g && suffix[i + n - 1 - f]! < i - g) {
        suffix[i] = suffix[i + n - 1 - f]!
      } else {
        if (i < g) g = i
        f = i
        while (g >= 0 && this.pattern[g] === this.pattern[g + n - 1 - f]) {
          g--
        }
        suffix[i] = f - g
      }
    }

    for (let i = 0; i < n; i++) {
      table[i] = n
    }

    let j = 0
    for (let i = n - 1; i >= 0; i--) {
      if (suffix[i] === i + 1) {
        while (j < n - 1 - i) {
          if (table[j] === n) table[j] = n - 1 - i
          j++
        }
      }
    }

    for (let i = 0; i <= n - 2; i++) {
      table[n - 1 - suffix[i]!] = n - 1 - i
    }

    return table
  }

  toString(): string {
    return `BoyerMoore(pattern="${this.pattern}", caseSensitive=${this.caseSensitive})`
  }

  toJSON(): unknown {
    return {
      pattern: this.pattern,
      caseSensitive: this.caseSensitive,
    }
  }

  clone(): this {
    return new BoyerMoore(this.pattern, { caseSensitive: this.caseSensitive }) as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BoyerMoore)) return false
    if (this.caseSensitive !== other.caseSensitive) return false
    if (this.pattern !== other.pattern) return false
    return true
  }
}
