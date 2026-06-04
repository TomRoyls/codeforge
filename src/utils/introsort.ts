export class Introsort {
  static sort<T>(arr: T[], compare: (a: T, b: T) => number = (a, b) => String(a).localeCompare(String(b))): T[] {
    if (arr.length <= 1) return arr
    const maxDepth = Math.floor(Math.log2(arr.length)) * 2
    Introsort.introsort(arr, 0, arr.length - 1, maxDepth, compare)
    return arr
  }

  private static introsort<T>(arr: T[], lo: number, hi: number, depth: number, compare: (a: T, b: T) => number): void {
    const sizeThreshold = 16
    if (hi - lo < sizeThreshold) {
      Introsort.insertionSort(arr, lo, hi, compare)
      return
    }
    if (depth === 0) {
      Introsort.heapSort(arr, lo, hi, compare)
      return
    }
    const pivot = Introsort.partition(arr, lo, hi, compare)
    Introsort.introsort(arr, lo, pivot - 1, depth - 1, compare)
    Introsort.introsort(arr, pivot + 1, hi, depth - 1, compare)
  }

  private static partition<T>(arr: T[], lo: number, hi: number, compare: (a: T, b: T) => number): number {
    const mid = (lo + hi) >> 1
    const pivot = Introsort.medianOfThree(arr[lo]!, arr[mid]!, arr[hi]!, compare)
    if (compare(arr[lo]!, pivot) !== 0) {
      const idx = compare(arr[mid]!, pivot) === 0 ? mid : hi
      ;[arr[lo]!, arr[idx]!] = [arr[idx]!, arr[lo]!]
    }
    let i = lo + 1
    let j = hi
    while (true) {
      while (i <= hi && compare(arr[i]!, arr[lo]!) < 0) i++
      while (j > lo && compare(arr[j]!, arr[lo]!) > 0) j--
      if (i >= j) break
      ;[arr[i]!, arr[j]!] = [arr[j]!, arr[i]!]
      i++
      j--
    }
    ;[arr[lo]!, arr[j]!] = [arr[j]!, arr[lo]!]
    return j
  }

  private static medianOfThree<T>(a: T, b: T, c: T, compare: (a: T, b: T) => number): T {
    if (compare(a, b) > 0) { if (compare(b, c) > 0) return b; return compare(a, c) > 0 ? c : a }
    if (compare(a, c) > 0) return a
    return compare(b, c) > 0 ? c : b
  }

  private static insertionSort<T>(arr: T[], lo: number, hi: number, compare: (a: T, b: T) => number): void {
    for (let i = lo + 1; i <= hi; i++) {
      const key = arr[i]!
      let j = i - 1
      while (j >= lo && compare(arr[j]!, key) > 0) {
        arr[j + 1] = arr[j]!
        j--
      }
      arr[j + 1] = key
    }
  }

  private static heapSort<T>(arr: T[], lo: number, hi: number, compare: (a: T, b: T) => number): void {
    const n = hi - lo + 1
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) Introsort.heapify(arr, lo, n, i, compare)
    for (let i = n - 1; i > 0; i--) {
      ;[arr[lo]!, arr[lo + i]!] = [arr[lo + i]!, arr[lo]!]
      Introsort.heapify(arr, lo, i, 0, compare)
    }
  }

  private static heapify<T>(arr: T[], lo: number, n: number, i: number, compare: (a: T, b: T) => number): void {
    let largest = i
    const left = 2 * i + 1
    const right = 2 * i + 2
    if (left < n && compare(arr[lo + left]!, arr[lo + largest]!) > 0) largest = left
    if (right < n && compare(arr[lo + right]!, arr[lo + largest]!) > 0) largest = right
    if (largest !== i) {
      ;[arr[lo + i]!, arr[lo + largest]!] = [arr[lo + largest]!, arr[lo + i]!]
      Introsort.heapify(arr, lo, n, largest, compare)
    }
  }
}
