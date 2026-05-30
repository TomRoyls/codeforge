export class RabinKarp {
  private readonly base: number
  private readonly mod: number

  constructor(base: number = 256, mod: number = 1_000_000_007) {
    this.base = base
    this.mod = mod
  }

  search(text: string, pattern: string): number[] {
    if (pattern.length === 0 || pattern.length > text.length) return []
    const results: number[] = []
    const m = pattern.length
    const n = text.length

    const highOrderBase = this.powMod(this.base, m - 1)
    let patternHash = 0
    let textHash = 0

    for (let i = 0; i < m; i++) {
      patternHash = (patternHash * this.base + pattern.charCodeAt(i)) % this.mod
      textHash = (textHash * this.base + text.charCodeAt(i)) % this.mod
    }

    for (let i = 0; i <= n - m; i++) {
      if (textHash === patternHash && this.verify(text, pattern, i)) {
        results.push(i)
      }
      if (i < n - m) {
        textHash = ((textHash - text.charCodeAt(i) * highOrderBase) * this.base + text.charCodeAt(i + m)) % this.mod
        if (textHash < 0) textHash += this.mod
      }
    }

    return results
  }

  contains(text: string, pattern: string): boolean {
    return this.search(text, pattern).length > 0
  }

  count(text: string, pattern: string): number {
    return this.search(text, pattern).length
  }

  searchMultiple(text: string, patterns: string[]): Map<string, number[]> {
    const result = new Map<string, number[]>()
    for (const pattern of patterns) {
      result.set(pattern, this.search(text, pattern))
    }
    return result
  }

  private verify(text: string, pattern: string, start: number): boolean {
    for (let i = 0; i < pattern.length; i++) {
      if (text[start + i] !== pattern[i]) return false
    }
    return true
  }

  private powMod(base: number, exp: number): number {
    let result = 1
    let b = base % this.mod
    let e = exp
    while (e > 0) {
      if (e % 2 === 1) result = (result * b) % this.mod
      e = Math.floor(e / 2)
      b = (b * b) % this.mod
    }
    return result
  }
}
