export class QuickSelect {
  static select(arr: number[], k: number): number {
    if (k < 0 || k >= arr.length) throw new RangeError(`k=${k} out of range [0, ${arr.length})`)
    const copy = [...arr]
    return QuickSelect.partition(copy, 0, copy.length - 1, k)
  }

  private static partition(arr: number[], left: number, right: number, k: number): number {
    while (true) {
      if (left === right) return arr[left]!
      const pivotIdx = left + Math.floor(Math.random() * (right - left + 1))
      QuickSelect.swap(arr, pivotIdx, right)
      const pivot = arr[right]!
      let storeIdx = left
      for (let i = left; i < right; i++) {
        if (arr[i]! < pivot) {
          QuickSelect.swap(arr, i, storeIdx)
          storeIdx++
        }
      }
      QuickSelect.swap(arr, storeIdx, right)
      if (storeIdx === k) return arr[storeIdx]!
      if (k < storeIdx) {
        right = storeIdx - 1
      } else {
        left = storeIdx + 1
      }
    }
  }

  static median(arr: number[]): number {
    if (arr.length === 0) throw new RangeError('empty array')
    const n = arr.length
    if (n % 2 === 1) return QuickSelect.select(arr, Math.floor(n / 2))
    const a = QuickSelect.select(arr, n / 2 - 1)
    const b = QuickSelect.select(arr, n / 2)
    return (a + b) / 2
  }

  static kthSmallest(arr: number[], k: number): number {
    return QuickSelect.select(arr, k)
  }

  static kthLargest(arr: number[], k: number): number {
    return QuickSelect.select(arr, arr.length - 1 - k)
  }

  static partitionAround(arr: number[], k: number): { left: number[]; right: number[] } {
    const pivot = QuickSelect.select(arr, k)
    const left: number[] = []
    const right: number[] = []
    for (const x of arr) {
      if (x < pivot) left.push(x)
      else right.push(x)
    }
    return { left, right }
  }

  private static swap(arr: number[], i: number, j: number): void {
    const temp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = temp
  }
}
