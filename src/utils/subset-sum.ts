export class SubsetSum {
  static hasSubset(arr: number[], target: number): boolean {
    const dp = new Uint8Array(target + 1)
    dp[0] = 1
    for (const num of arr) {
      for (let j = target; j >= num; j--) {
        if (dp[j - num]) dp[j] = 1
      }
    }
    return dp[target] === 1
  }

  static findSubset(arr: number[], target: number): number[] | null {
    const n = arr.length
    const dp: boolean[][] = Array.from({ length: n + 1 }, () => new Array(target + 1).fill(false))
    dp[0]![0] = true
    for (let i = 1; i <= n; i++) {
      for (let j = 0; j <= target; j++) {
        dp[i]![j]! = dp[i - 1]![j]! || (j >= arr[i - 1]! && dp[i - 1]![j - arr[i - 1]!]!)
      }
    }
    if (!dp[n]![target]) return null
    const result: number[] = []
    let remaining = target
    for (let i = n; i > 0; i--) {
      if (!dp[i - 1]![remaining]) {
        result.push(arr[i - 1]!)
        remaining -= arr[i - 1]!
      }
    }
    return result
  }

  static findAllSubsets(arr: number[], target: number): number[][] {
    const result: number[][] = []
    SubsetSum.backtrack(arr, target, 0, [], result)
    return result
  }

  private static backtrack(
    arr: number[], remaining: number, start: number, current: number[], result: number[][]
  ): void {
    if (remaining === 0) {
      result.push([...current])
      return
    }
    for (let i = start; i < arr.length; i++) {
      if (arr[i]! > remaining) continue
      current.push(arr[i]!)
      SubsetSum.backtrack(arr, remaining - arr[i]!, i + 1, current, result)
      current.pop()
    }
  }

  static countSubsets(arr: number[], target: number): number {
    const dp = new Array<number>(target + 1).fill(0)
    dp[0] = 1
    for (const num of arr) {
      for (let j = target; j >= num; j--) {
        dp[j]! += dp[j - num]!
      }
    }
    return dp[target]!
  }
}
