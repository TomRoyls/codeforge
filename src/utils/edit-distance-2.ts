export class EditDistance2 {
  static compute(s1: string, s2: string): number {
    const m = s1.length, n = s2.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1]
        else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
    return dp[m][n]
  }

  static withOperations(s1: string, s2: string): { distance: number; ops: string[] } {
    const m = s1.length, n = s2.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1]
        else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }

    const ops: string[] = []
    let i = m, j = n
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && s1[i - 1] === s2[j - 1]) { i--; j-- }
      else if (i > 0 && (j === 0 || dp[i - 1][j] <= dp[i][j - 1])) { ops.unshift(`delete '${s1[i - 1]}'`); i-- }
      else if (j > 0 && (i === 0 || dp[i - 1][j] > dp[i][j - 1])) { ops.unshift(`insert '${s2[j - 1]}'`); j-- }
      else { ops.unshift(`replace '${s1[i - 1]}' with '${s2[j - 1]}'`); i--; j-- }
    }

    return { distance: dp[m][n], ops }
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): EditDistance2 { return new EditDistance2() }
  equals(other: unknown): boolean { return other instanceof EditDistance2 }
}
