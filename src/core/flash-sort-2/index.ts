import type { CompareFn } from '../types.js'

export class FlashSort2<T> {
  private compare: CompareFn<T>

  constructor(comparator?: CompareFn<T>) {
    this.compare = comparator || ((a: T, b: T) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
  }

  sort(arr: T[]): T[] {
    if (arr.length <= 1) {
      return [...arr]
    }

    const result = [...arr]
    this.sortInPlace(result)
    return result
  }

  sortInPlace(arr: T[]): void {
    const n = arr.length
    if (n <= 1) {
      return
    }

    let min = arr[0]!
    let max = arr[0]!

    for (let i = 1; i < n; i++) {
      const val = arr[i]!
      if (this.compare(val, min) < 0) {
        min = val
      }
      if (this.compare(val, max) > 0) {
        max = val
      }
    }

    if (this.compare(min, max) === 0) {
      return
    }

    const m = Math.max(1, Math.floor(0.43 * n))
    const buckets = new Array<T[]>(m)

    for (let i = 0; i < m; i++) {
      buckets[i] = []
    }

    for (let i = 0; i < n; i++) {
      const val = arr[i]!
      const bucketIndex = this.getBucketIndex(val, min, max, m)
      buckets[bucketIndex]!.push(val)
    }

    let pos = 0
    for (let i = 0; i < m; i++) {
      const bucket = buckets[i]!
      this.insertionSort(bucket)
      for (let j = 0; j < bucket.length; j++) {
        arr[pos++] = bucket[j]!
      }
    }
  }

  private getBucketIndex(val: T, min: T, max: T, m: number): number {
    const cmpMin = this.compare(val, min)
    const cmpMax = this.compare(val, max)

    if (cmpMin === 0) {
      return 0
    }
    if (cmpMax >= 0) {
      return m - 1
    }

    const minNum = min as unknown as number
    const maxNum = max as unknown as number
    const valNum = val as unknown as number

    if (typeof minNum === 'number' && typeof maxNum === 'number' && typeof valNum === 'number' && !Number.isNaN(minNum) && !Number.isNaN(maxNum) && !Number.isNaN(valNum)) {
      const range = maxNum - minNum
      if (range === 0) {
        return 0
      }
      const ratio = (valNum - minNum) / range
      return Math.min(m - 1, Math.floor(ratio * m))
    }

    for (let i = 0; i < m; i++) {
      const mid = i / (m - 1)
      const threshold = mid >= 0.5 ? max : min
      const cmpThreshold = this.compare(val, threshold)
      if (cmpThreshold < 0) {
        return Math.min(i, m - 1)
      }
    }

    return m - 1
  }

  private insertionSort(arr: T[]): void {
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i]!
      let j = i - 1
      while (j >= 0 && this.compare(arr[j]!, key) > 0) {
        arr[j + 1] = arr[j]!
        j--
      }
      arr[j + 1] = key
    }
  }

  toString(): string {
    return `FlashSort2()`
  }

  static empty<T>(): FlashSort2<T> {
    return new FlashSort2<T>()
  }
}
