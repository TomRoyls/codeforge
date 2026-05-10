import type { BagOptions, BagStats } from './types.js'

export class Bag<T = unknown> {
  private _counts: Map<T, number>
  private _totalSize: number

  constructor(_options?: Partial<BagOptions<T>>) {
    this._counts = new Map()
    this._totalSize = 0
  }

  add(value: T, count: number = 1): void {
    if (count < 1) return
    const current = this._counts.get(value) ?? 0
    this._counts.set(value, current + count)
    this._totalSize += count
  }

  remove(value: T, count: number = 1): number {
    if (count < 1) return 0
    const current = this._counts.get(value)
    if (current === undefined) return 0
    const removed = Math.min(count, current)
    const remaining = current - removed
    if (remaining === 0) {
      this._counts.delete(value)
    } else {
      this._counts.set(value, remaining)
    }
    this._totalSize -= removed
    return removed
  }

  countOf(value: T): number {
    return this._counts.get(value) ?? 0
  }

  contains(value: T): boolean {
    return this._counts.has(value)
  }

  get size(): number {
    return this._totalSize
  }

  get uniqueSize(): number {
    return this._counts.size
  }

  isEmpty(): boolean {
    return this._totalSize === 0
  }

  clear(): void {
    this._counts.clear()
    this._totalSize = 0
  }

  clone(): Bag<T> {
    const copy = new Bag<T>()
    for (const [value, count] of this._counts) {
      copy._counts.set(value, count)
    }
    copy._totalSize = this._totalSize
    return copy
  }

  toArray(): T[] {
    const result: T[] = []
    for (const [value, count] of this._counts) {
      for (let i = 0; i < count; i++) {
        result.push(value)
      }
    }
    return result
  }

  uniqueValues(): T[] {
    return Array.from(this._counts.keys())
  }

  forEach(callback: (value: T) => void): void {
    for (const [value, count] of this._counts) {
      for (let i = 0; i < count; i++) {
        callback(value)
      }
    }
  }

  static from<U>(items: Iterable<U>, options?: Partial<BagOptions<U>>): Bag<U> {
    const bag = new Bag<U>(options)
    for (const item of items) {
      bag.add(item)
    }
    return bag
  }

  union(other: Bag<T>): Bag<T> {
    const result = new Bag<T>()
    let totalSize = 0
    for (const [value, count] of this._counts) {
      const otherCount = other._counts.get(value) ?? 0
      const maxC = Math.max(count, otherCount)
      result._counts.set(value, maxC)
      totalSize += maxC
    }
    for (const [value, count] of other._counts) {
      if (!this._counts.has(value)) {
        result._counts.set(value, count)
        totalSize += count
      }
    }
    result._totalSize = totalSize
    return result
  }

  intersection(other: Bag<T>): Bag<T> {
    const result = new Bag<T>()
    let totalSize = 0
    for (const [value, count] of this._counts) {
      const otherCount = other._counts.get(value) ?? 0
      const minC = Math.min(count, otherCount)
      if (minC > 0) {
        result._counts.set(value, minC)
        totalSize += minC
      }
    }
    result._totalSize = totalSize
    return result
  }

  difference(other: Bag<T>): Bag<T> {
    const result = new Bag<T>()
    let totalSize = 0
    for (const [value, count] of this._counts) {
      const otherCount = other._counts.get(value) ?? 0
      const diff = count - otherCount
      if (diff > 0) {
        result._counts.set(value, diff)
        totalSize += diff
      }
    }
    result._totalSize = totalSize
    return result
  }

  isSubsetOf(other: Bag<T>): boolean {
    for (const [value, count] of this._counts) {
      const otherCount = other._counts.get(value) ?? 0
      if (count > otherCount) return false
    }
    return true
  }

  stats(): BagStats {
    if (this._counts.size === 0) {
      return {
        size: 0,
        uniqueSize: 0,
        minCount: 0,
        maxCount: 0,
        meanCount: 0,
      }
    }
    let minCount = Infinity
    let maxCount = -Infinity
    for (const count of this._counts.values()) {
      if (count < minCount) minCount = count
      if (count > maxCount) maxCount = count
    }
    return {
      size: this._totalSize,
      uniqueSize: this._counts.size,
      minCount,
      maxCount,
      meanCount: this._totalSize / this._counts.size,
    }
  }
}

export type { BagOptions, BagStats } from './types.js'
