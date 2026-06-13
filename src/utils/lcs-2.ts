export class LCS2 {
  static compute(s1: string, s2: string): string {
    const m = s1.length, n = s2.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }

    let i = m, j = n
    const result: string[] = []
    while (i > 0 && j > 0) {
      if (s1[i - 1] === s2[j - 1]) { result.unshift(s1[i - 1]); i--; j-- }
      else if (dp[i - 1][j] > dp[i][j - 1]) i--
      else j--
    }
    return result.join('')
  }

  static length(s1: string, s2: string): number {
    return LCS2.compute(s1, s2).length
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): LCS2 { return new LCS2() }
  equals(other: unknown): boolean { return other instanceof LCS2 }
}
