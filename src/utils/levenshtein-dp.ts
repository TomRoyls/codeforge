export class LevenshteinDP {
  compute(s1: string, s2: string): number {
    const m = s1.length, n = s2.length
    if (m === 0) return n
    if (n === 0) return m
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    for (let i = 0; i <= m; i++) dp[i]![0] = i
    for (let j = 0; j <= n; j++) dp[0]![j] = j
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
        dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost)
      }
    }
    return dp[m]![n]!
  }

  computeMatrix(s1: string, s2: string): number[][] {
    const m = s1.length, n = s2.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    for (let i = 0; i <= m; i++) dp[i]![0] = i
    for (let j = 0; j <= n; j++) dp[0]![j] = j
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
        dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost)
      }
    }
    return dp
  }

  ratio(s1: string, s2: string): number {
    if (s1.length === 0 && s2.length === 0) return 1
    const dist = this.compute(s1, s2)
    return 1 - dist / Math.max(s1.length, s2.length)
  }

  get name(): string { return 'LevenshteinDP' }
  toString(): string { return JSON.stringify({ name: this.name }) }
  toJSON(): Record<string, string> { return { name: this.name } }
  clone(): LevenshteinDP { return new LevenshteinDP() }
  equals(other: unknown): boolean { return other instanceof LevenshteinDP }
  toArray(): string[] { return ['levenshtein-dp'] }
}
