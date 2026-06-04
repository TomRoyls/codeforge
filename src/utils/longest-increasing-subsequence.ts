export class LongestIncreasingSubsequence {
  static length(arr: number[]): number {
    if (arr.length === 0) return 0
    const tails: number[] = []
    for (const x of arr) {
      let lo = 0
      let hi = tails.length
      while (lo < hi) {
        const mid = (lo + hi) >>> 1
        if (tails[mid]! < x) lo = mid + 1
        else hi = mid
      }
      if (lo === tails.length) tails.push(x)
      else tails[lo] = x
    }
    return tails.length
  }

  static find(arr: number[]): number[] {
    if (arr.length === 0) return []
    const n = arr.length
    const tails: number[] = []
    const tailsIdx: number[] = []
    const prev = new Array<number>(n).fill(-1)
    for (let i = 0; i < n; i++) {
      const x = arr[i]!
      let lo = 0
      let hi = tails.length
      while (lo < hi) {
        const mid = (lo + hi) >>> 1
        if (tails[mid]! < x) lo = mid + 1
        else hi = mid
      }
      if (lo > 0) prev[i] = tailsIdx[lo - 1]!
      if (lo === tails.length) {
        tails.push(x)
        tailsIdx.push(i)
      } else {
        tails[lo] = x
        tailsIdx[lo] = i
      }
    }
    const result: number[] = []
    let k = tailsIdx[tailsIdx.length - 1]!
    while (k !== -1) {
      result.push(arr[k]!)
      k = prev[k]!
    }
    return result.reverse()
  }

  static lengthNonDecreasing(arr: number[]): number {
    if (arr.length === 0) return 0
    const tails: number[] = []
    for (const x of arr) {
      let lo = 0
      let hi = tails.length
      while (lo < hi) {
        const mid = (lo + hi) >>> 1
        if (tails[mid]! <= x) lo = mid + 1
        else hi = mid
      }
      if (lo === tails.length) tails.push(x)
      else tails[lo] = x
    }
    return tails.length
  }

  static countLIS(arr: number[]): number {
    if (arr.length === 0) return 0
    const n = arr.length
    const lengths = new Array<number>(n).fill(1)
    const counts = new Array<number>(n).fill(1)
    for (let i = 1; i < n; i++) {
      for (let j = 0; j < i; j++) {
        if (arr[j]! < arr[i]!) {
          if (lengths[j]! + 1 > lengths[i]!) {
            lengths[i] = lengths[j]! + 1
            counts[i] = counts[j]!
          } else if (lengths[j]! + 1 === lengths[i]!) {
            counts[i]! += counts[j]!
          }
        }
      }
    }
    const maxLen = Math.max(...lengths)
    let total = 0
    for (let i = 0; i < n; i++) {
      if (lengths[i] === maxLen) total += counts[i]!
    }
    return total
  }
}
