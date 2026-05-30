export class EditDistance {
  static levenshtein(a: string, b: string): number {
    const m = a.length
    const n = b.length
    if (m === 0) return n
    if (n === 0) return m
    let prev = new Array<number>(n + 1).fill(0)
    for (let j = 0; j <= n; j++) prev[j] = j
    for (let i = 1; i <= m; i++) {
      const curr = new Array<number>(n + 1).fill(0)
      curr[0] = i
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          curr[j] = prev[j - 1]!
        } else {
          curr[j] = 1 + Math.min(prev[j - 1]!, prev[j]!, curr[j - 1]!)
        }
      }
      prev = curr
    }
    return prev[n]!
  }

  static damerauLevenshtein(a: string, b: string): number {
    const m = a.length
    const n = b.length
    if (m === 0) return n
    if (n === 0) return m
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0) as number[])
    for (let i = 0; i <= m; i++) dp[i]![0] = i
    for (let j = 0; j <= n; j++) dp[0]![j] = j
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        dp[i]![j] = Math.min(
          dp[i - 1]![j]! + 1,
          dp[i]![j - 1]! + 1,
          dp[i - 1]![j - 1]! + cost,
        )
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          dp[i]![j] = Math.min(dp[i]![j]!, dp[i - 2]![j - 2]! + cost)
        }
      }
    }
    return dp[m]![n]!
  }

  static hamming(a: string, b: string): number {
    if (a.length !== b.length) throw new Error('Strings must be same length for Hamming distance')
    let distance = 0
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) distance++
    }
    return distance
  }

  static normalizedLevenshtein(a: string, b: string): number {
    if (a.length === 0 && b.length === 0) return 1
    const maxLen = Math.max(a.length, b.length)
    return 1 - EditDistance.levenshtein(a, b) / maxLen
  }
}
