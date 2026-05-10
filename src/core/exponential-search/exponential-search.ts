import type { ExponentialSearchOptions } from './types.js'

const defaultComparator = (a: number, b: number): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class ExponentialSearch<T = number> {
  private readonly arr: T[]
  private readonly comparator: (a: T, b: T) => number

  constructor(arr: T[], options?: ExponentialSearchOptions<T>) {
    this.arr = arr
    this.comparator = (options?.comparator ?? defaultComparator) as (
      a: T,
      b: T
    ) => number
  }

  private binarySearch(
    arr: T[],
    target: T,
    low: number,
    high: number
  ): number {
    while (low <= high) {
      const mid = low + ((high - low) >>> 1)
      const cmp = this.comparator(arr[mid]!, target)
      if (cmp === 0) return mid
      if (cmp < 0) {
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    return -1
  }

  private findBound(target: T): [number, number] {
    const n = this.arr.length
    if (n === 0) return [0, 0]
    if (this.comparator(this.arr[0]!, target) >= 0) return [0, 0]
    let bound = 1
    while (bound < n && this.comparator(this.arr[bound]!, target) < 0) {
      bound *= 2
    }
    return [bound >>> 1, Math.min(bound, n - 1)]
  }

  search(target: T): number {
    const n = this.arr.length
    if (n === 0) return -1
    if (n === 1) {
      return this.comparator(this.arr[0]!, target) === 0 ? 0 : -1
    }
    const [low, high] = this.findBound(target)
    return this.binarySearch(this.arr, target, low, high)
  }

  indexOf(target: T): number {
    return this.search(target)
  }

  contains(target: T): boolean {
    return this.search(target) !== -1
  }

  lowerBound(target: T): number {
    return ExponentialSearch.lowerBound(this.arr, target, this.comparator)
  }

  upperBound(target: T): number {
    return ExponentialSearch.upperBound(this.arr, target, this.comparator)
  }

  findRange(target: T): [number, number] {
    return ExponentialSearch.findRange(this.arr, target, this.comparator)
  }

  findInsertPosition(target: T): number {
    return this.lowerBound(target)
  }

  count(target: T): number {
    const [lo, hi] = this.findRange(target)
    return hi - lo
  }

  min(): T | undefined {
    return this.arr.length > 0 ? this.arr[0] : undefined
  }

  max(): T | undefined {
    return this.arr.length > 0 ? this.arr[this.arr.length - 1] : undefined
  }

  static search<T>(
    arr: T[],
    target: T,
    comparator?: (a: T, b: T) => number
  ): number {
    const cmp = (comparator ?? defaultComparator) as (a: T, b: T) => number
    const n = arr.length
    if (n === 0) return -1
    if (n === 1) {
      return cmp(arr[0]!, target) === 0 ? 0 : -1
    }

    if (cmp(arr[0]!, target) >= 0) {
      if (cmp(arr[0]!, target) === 0) return 0
      return -1
    }

    let bound = 1
    while (bound < n && cmp(arr[bound]!, target) < 0) {
      bound *= 2
    }

    const low = bound >>> 1
    const high = Math.min(bound, n - 1)

    let left = low
    let right = high
    while (left <= right) {
      const mid = left + ((right - left) >>> 1)
      const c = cmp(arr[mid]!, target)
      if (c === 0) return mid
      if (c < 0) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
    return -1
  }

  static lowerBound<T>(
    arr: T[],
    target: T,
    comparator?: (a: T, b: T) => number
  ): number {
    const cmp = (comparator ?? defaultComparator) as (a: T, b: T) => number
    const n = arr.length
    if (n === 0) return 0

    if (cmp(arr[0]!, target) >= 0) return 0

    let bound = 1
    while (bound < n && cmp(arr[bound]!, target) < 0) {
      bound *= 2
    }

    const searchLow = bound >>> 1
    const searchHigh = Math.min(bound, n)

    let left = searchLow
    let right = searchHigh
    while (left < right) {
      const mid = left + ((right - left) >>> 1)
      if (cmp(arr[mid]!, target) < 0) {
        left = mid + 1
      } else {
        right = mid
      }
    }
    return left
  }

  static upperBound<T>(
    arr: T[],
    target: T,
    comparator?: (a: T, b: T) => number
  ): number {
    const cmp = (comparator ?? defaultComparator) as (a: T, b: T) => number
    const n = arr.length
    if (n === 0) return 0

    if (cmp(arr[0]!, target) > 0) return 0

    let bound = 1
    while (bound < n && cmp(arr[bound]!, target) <= 0) {
      bound *= 2
    }

    const searchLow = bound >>> 1
    const searchHigh = Math.min(bound, n)

    let left = searchLow
    let right = searchHigh
    while (left < right) {
      const mid = left + ((right - left) >>> 1)
      if (cmp(arr[mid]!, target) <= 0) {
        left = mid + 1
      } else {
        right = mid
      }
    }
    return left
  }

  static findRange<T>(
    arr: T[],
    target: T,
    comparator?: (a: T, b: T) => number
  ): [number, number] {
    const lo = ExponentialSearch.lowerBound(arr, target, comparator)
    const hi = ExponentialSearch.upperBound(arr, target, comparator)
    return [lo, hi]
  }
}
