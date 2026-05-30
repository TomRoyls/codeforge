export class LevenshteinDistance {
  static distance(a: string, b: string): number {
    if (a.length === 0) return b.length
    if (b.length === 0) return a.length
    const m = a.length
    const n = b.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
    for (let i = 0; i <= m; i++) dp[i]![0] = i
    for (let j = 0; j <= n; j++) dp[0]![j] = j
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        dp[i]![j] = Math.min(
          dp[i - 1]![j]! + 1,
          dp[i]![j - 1]! + 1,
          dp[i - 1]![j - 1]! + cost
        )
      }
    }
    return dp[m]![n]!
  }

  static distanceOptimized(a: string, b: string): number {
    if (a.length === 0) return b.length
    if (b.length === 0) return a.length
    if (a.length < b.length) { const tmp = a; a = b; b = tmp }
    const n = b.length
    let prev = Array.from({ length: n + 1 }, (_, j) => j)
    let curr = new Array<number>(n + 1).fill(0)
    for (let i = 1; i <= a.length; i++) {
      curr[0] = i
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost)
      }
      const tmp = prev
      prev = curr
      curr = tmp
    }
    return prev[n]!
  }

  static similarity(a: string, b: string): number {
    if (a.length === 0 && b.length === 0) return 1
    const maxLen = Math.max(a.length, b.length)
    return 1 - LevenshteinDistance.distance(a, b) / maxLen
  }

  static normalizedDistance(a: string, b: string): number {
    if (a.length === 0 && b.length === 0) return 0
    const maxLen = Math.max(a.length, b.length)
    return LevenshteinDistance.distance(a, b) / maxLen
  }

  static findClosest(target: string, candidates: string[]): string | null {
    if (candidates.length === 0) return null
    let best = candidates[0]!
    let bestDist = LevenshteinDistance.distance(target, best)
    for (let i = 1; i < candidates.length; i++) {
      const d = LevenshteinDistance.distance(target, candidates[i]!)
      if (d < bestDist) {
        bestDist = d
        best = candidates[i]!
      }
    }
    return best
  }

  static editOperations(a: string, b: string): { type: 'insert' | 'delete' | 'replace' | 'match'; from: number; to: number }[] {
    const m = a.length
    const n = b.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
    for (let i = 0; i <= m; i++) dp[i]![0] = i
    for (let j = 0; j <= n; j++) dp[0]![j] = j
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost)
      }
    }
    const ops: { type: 'insert' | 'delete' | 'replace' | 'match'; from: number; to: number }[] = []
    let i = m
    let j = n
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        ops.push({ type: 'match', from: i - 1, to: j - 1 })
        i--; j--
      } else if (i > 0 && j > 0 && dp[i]![j] === dp[i - 1]![j - 1]! + 1) {
        ops.push({ type: 'replace', from: i - 1, to: j - 1 })
        i--; j--
      } else if (j > 0 && dp[i]![j] === dp[i]![j - 1]! + 1) {
        ops.push({ type: 'insert', from: i, to: j - 1 })
        j--
      } else {
        ops.push({ type: 'delete', from: i - 1, to: j })
        i--
      }
    }
    return ops.reverse()
  }
}
