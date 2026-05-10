import type { SortedBagOptions } from './types.js'

export class SortedBag<T> {
  private data: T[] = []
  private compare: (a: T, b: T) => number

  constructor(options?: SortedBagOptions<T>) {
    this.compare = options?.comparator ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  add(item: T): void {
    const idx = this.binarySearchForInsert(item)
    this.data.splice(idx, 0, item)
  }

  remove(item: T): boolean {
    const idx = this.binarySearchExact(item)
    if (idx === -1) return false
    this.data.splice(idx, 1)
    return true
  }

  has(item: T): boolean {
    return this.binarySearchExact(item) !== -1
  }

  get size(): number {
    return this.data.length
  }

  clear(): void {
    this.data = []
  }

  count(item: T): number {
    const left = this.lowerBound(item)
    const right = this.upperBound(item)
    return right - left
  }

  min(): T | undefined {
    return this.data[0]
  }

  max(): T | undefined {
    return this.data[this.data.length - 1]
  }

  nth(index: number): T | undefined {
    if (index < 0 || index >= this.data.length) return undefined
    return this.data[index]
  }

  toArray(): T[] {
    return [...this.data]
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this.data.length; i++) {
      callback(this.data[i]!, i)
    }
  }

  containsAll(other: SortedBag<T>): boolean {
    if (other.size === 0) return true
    if (this.size === 0) return false

    const otherItems = other.toArray()
    const otherCounts = new Map<T, number>()
    for (const item of otherItems) {
      otherCounts.set(item, (otherCounts.get(item) ?? 0) + 1)
    }

    for (const [item, needed] of otherCounts) {
      if (this.count(item) < needed) return false
    }
    return true
  }

  addAll(items: T[]): void {
    for (const item of items) {
      this.add(item)
    }
  }

  removeAll(items: T[]): void {
    for (const item of items) {
      this.remove(item)
    }
  }

  retainAll(items: T[]): void {
    const retainCounts = new Map<T, number>()
    for (const item of items) {
      retainCounts.set(item, (retainCounts.get(item) ?? 0) + 1)
    }
    const newData: T[] = []
    const seenCounts = new Map<T, number>()
    for (const item of this.data) {
      const needed = retainCounts.get(item) ?? 0
      const used = seenCounts.get(item) ?? 0
      if (used < needed) {
        newData.push(item)
        seenCounts.set(item, used + 1)
      }
    }
    this.data = newData
  }

  first(): T | undefined {
    return this.data[0]
  }

  last(): T | undefined {
    return this.data[this.data.length - 1]
  }

  lower(item: T): T | undefined {
    const idx = this.lowerBound(item)
    if (idx === 0) return undefined
    return this.data[idx - 1]
  }

  higher(item: T): T | undefined {
    const idx = this.upperBound(item)
    if (idx >= this.data.length) return undefined
    return this.data[idx]
  }

  floor(item: T): T | undefined {
    const idx = this.upperBound(item)
    if (idx === 0) return undefined
    return this.data[idx - 1]
  }

  ceiling(item: T): T | undefined {
    const idx = this.lowerBound(item)
    if (idx >= this.data.length) return undefined
    return this.data[idx]
  }

  private binarySearchForInsert(item: T): number {
    let lo = 0
    let hi = this.data.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.compare(this.data[mid]!, item) < 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  private binarySearchExact(item: T): number {
    const idx = this.lowerBound(item)
    if (idx < this.data.length && this.compare(this.data[idx]!, item) === 0) {
      return idx
    }
    return -1
  }

  private lowerBound(item: T): number {
    let lo = 0
    let hi = this.data.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.compare(this.data[mid]!, item) < 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  private upperBound(item: T): number {
    let lo = 0
    let hi = this.data.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.compare(this.data[mid]!, item) <= 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }
}
