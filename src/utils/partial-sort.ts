export class PartialSort {
  static smallestK(arr: number[], k: number): number[] {
    if (k <= 0) return []
    if (k >= arr.length) return [...arr].sort((a, b) => a - b)
    const copy = [...arr]
    PartialSort.quickSelect(copy, 0, copy.length - 1, k - 1)
    const result = copy.slice(0, k)
    result.sort((a, b) => a - b)
    return result
  }

  static largestK(arr: number[], k: number): number[] {
    if (k <= 0) return []
    if (k >= arr.length) return [...arr].sort((a, b) => b - a)
    const copy = [...arr]
    PartialSort.quickSelect(copy, 0, copy.length - 1, arr.length - k)
    const result = copy.slice(arr.length - k)
    result.sort((a, b) => b - a)
    return result
  }

  private static quickSelect(arr: number[], left: number, right: number, k: number): void {
    while (left < right) {
      const pivotIdx = left + Math.floor(Math.random() * (right - left + 1))
      PartialSort.swap(arr, pivotIdx, right)
      const pivot = arr[right]!
      let storeIdx = left
      for (let i = left; i < right; i++) {
        if (arr[i]! < pivot) {
          PartialSort.swap(arr, i, storeIdx)
          storeIdx++
        }
      }
      PartialSort.swap(arr, storeIdx, right)
      if (storeIdx === k) return
      if (k < storeIdx) {
        right = storeIdx - 1
      } else {
        left = storeIdx + 1
      }
    }
  }

  private static swap(arr: number[], i: number, j: number): void {
    const temp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = temp
  }

  static partitionPoint(arr: number[], predicate: (x: number) => boolean): number {
    let lo = 0
    let hi = arr.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (predicate(arr[mid]!)) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }
}
