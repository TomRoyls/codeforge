export class LcsFinder {
  longestCommon(s1: string, s2: string): string {
    const m = s1.length, n = s2.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) dp[i]![j] = dp[i - 1]![j - 1]! + 1
        else dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
      }
    }
    let i = m, j = n
    const result: string[] = []
    while (i > 0 && j > 0) {
      if (s1[i - 1] === s2[j - 1]) { result.unshift(s1[i - 1]!); i--; j-- }
      else if (dp[i - 1]![j]! > dp[i]![j - 1]!) i--
      else j--
    }
    return result.join('')
  }

  longestCommonLength(s1: string, s2: string): number {
    return this.longestCommon(s1, s2).length
  }

  get name(): string { return 'LcsFinder' }
  toString(): string { return JSON.stringify({ name: this.name }) }
  toJSON(): Record<string, string> { return { name: this.name } }
  clone(): LcsFinder { return new LcsFinder() }
  equals(other: unknown): boolean { return other instanceof LcsFinder }
  toArray(): string[] { return ['lcs-finder'] }
}
