export class PatternMatcher2 {
  private pattern: string

  constructor(pattern = '') {
    this.pattern = pattern
  }

  setPattern(p: string): void {
    this.pattern = p
  }

  naiveMatch(text: string): number[] {
    const result: number[] = []
    const n = text.length, m = this.pattern.length
    if (m === 0 || m > n) return result
    for (let i = 0; i <= n - m; i++) {
      let j = 0
      while (j < m && text[i + j] === this.pattern[j]) j++
      if (j === m) result.push(i)
    }
    return result
  }

  rabinKarp(text: string): number[] {
    const result: number[] = []
    const n = text.length, m = this.pattern.length
    if (m === 0 || m > n) return result
    const base = 256, mod = 1000000007
    let patHash = 0, txtHash = 0, h = 1
    for (let i = 0; i < m - 1; i++) h = (h * base) % mod
    for (let i = 0; i < m; i++) {
      patHash = (patHash * base + this.pattern.charCodeAt(i)) % mod
      txtHash = (txtHash * base + text.charCodeAt(i)) % mod
    }
    for (let i = 0; i <= n - m; i++) {
      if (patHash === txtHash) {
        let j = 0
        while (j < m && text[i + j] === this.pattern[j]) j++
        if (j === m) result.push(i)
      }
      if (i < n - m) {
        txtHash = (base * (txtHash - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % mod
        if (txtHash < 0) txtHash += mod
      }
    }
    return result
  }

  wildcardMatch(text: string): boolean {
    const p = this.pattern, t = text
    const dp: boolean[][] = Array.from({ length: p.length + 1 }, () => new Array(t.length + 1).fill(false))
    dp[0][0] = true
    for (let i = 1; i <= p.length; i++) {
      if (p[i - 1] === '*') dp[i][0] = dp[i - 1][0]
    }
    for (let i = 1; i <= p.length; i++) {
      for (let j = 1; j <= t.length; j++) {
        if (p[i - 1] === '*') {
          dp[i][j] = dp[i - 1][j] || dp[i][j - 1]
        } else if (p[i - 1] === '?' || p[i - 1] === t[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1]
        }
      }
    }
    return dp[p.length][t.length]
  }

  toArray(): string[] { return [this.pattern] }
  toString(): string { return JSON.stringify({ pattern: this.pattern }) }
  toJSON(): Record<string, unknown> { return { pattern: this.pattern } }
  clone(): PatternMatcher2 { return new PatternMatcher2(this.pattern) }
  equals(other: unknown): boolean { return other instanceof PatternMatcher2 && (other as PatternMatcher2).pattern === this.pattern }
}
