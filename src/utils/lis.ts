export class LongestIncreasingSubsequence {
  static length(arr: number[]): number {
    return LongestIncreasingSubsequence.compute(arr).length
  }

  static find(arr: number[]): number[] {
    const result = LongestIncreasingSubsequence.compute(arr)
    return result.subsequence
  }

  static findIndices(arr: number[]): number[] {
    const result = LongestIncreasingSubsequence.compute(arr)
    return result.indices
  }

  private static compute(arr: number[]): { length: number; subsequence: number[]; indices: number[] } {
    const n = arr.length
    if (n === 0) return { length: 0, subsequence: [], indices: [] }

    const tails: number[] = []
    const tailsIdx: number[] = []
    const prev = new Array(n).fill(-1)

    for (let i = 0; i < n; i++) {
      const val = arr[i]!
      let lo = 0
      let hi = tails.length

      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2)
        if (arr[tailsIdx[mid]!]! < val) {
          lo = mid + 1
        } else {
          hi = mid
        }
      }

      if (lo > 0) {
        prev[i] = tailsIdx[lo - 1]!
      }

      if (lo === tails.length) {
        tails.push(val)
        tailsIdx.push(i)
      } else {
        tails[lo] = val
        tailsIdx[lo] = i
      }
    }

    const subsequence: number[] = []
    const indices: number[] = []
    let k = tailsIdx[tailsIdx.length - 1]!
    while (k !== -1) {
      subsequence.push(arr[k]!)
      indices.push(k)
      k = prev[k]!
    }

    subsequence.reverse()
    indices.reverse()

    return { length: tails.length, subsequence, indices }
  }

  static countLIS(arr: number[]): number {
    const n = arr.length
    if (n === 0) return 0

    const dp = new Array(n).fill(1)
    for (let i = 1; i < n; i++) {
      for (let j = 0; j < i; j++) {
        if (arr[j]! < arr[i]!) {
          dp[i] = Math.max(dp[i]!, dp[j]! + 1)
        }
      }
    }
    return Math.max(...dp)
  }
}
