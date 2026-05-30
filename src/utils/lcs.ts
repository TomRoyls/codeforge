export class LCS {
  static length(a: string, b: string): number {
    const m = a.length
    const n = b.length
    let prev = new Array(n + 1).fill(0)
    const curr = new Array(n + 1).fill(0)
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          curr[j] = prev[j - 1] + 1
        } else {
          curr[j] = Math.max(prev[j]!, curr[j - 1]!)
        }
      }
      prev = [...curr]
    }
    return prev[n]!
  }

  static solve(a: string, b: string): string {
    const m = a.length
    const n = b.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0) as number[])
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i]![j] = dp[i - 1]![j - 1]! + 1
        } else {
          dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
        }
      }
    }
    const result: string[] = []
    let i = m, j = n
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        result.push(a[i - 1]!)
        i--
        j--
      } else if (dp[i - 1]![j]! > dp[i]![j - 1]!) {
        i--
      } else {
        j--
      }
    }
    return result.reverse().join('')
  }

  static solveArray<T>(a: T[], b: T[]): T[] {
    const m = a.length
    const n = b.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0) as number[])
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i]![j] = dp[i - 1]![j - 1]! + 1
        } else {
          dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
        }
      }
    }
    const result: T[] = []
    let i = m, j = n
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        result.push(a[i - 1]!)
        i--
        j--
      } else if (dp[i - 1]![j]! > dp[i]![j - 1]!) {
        i--
      } else {
        j--
      }
    }
    return result.reverse()
  }

  static similarity(a: string, b: string): number {
    if (a.length === 0 && b.length === 0) return 1
    const maxLen = Math.max(a.length, b.length)
    return LCS.length(a, b) / maxLen
  }
}
