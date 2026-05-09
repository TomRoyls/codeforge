import type { Comparator, MultisetOptions, MultisetStats } from './types.js'
import { DEFAULT_COMPARATOR } from './types.js'

export class Multiset<T = unknown> {
  private _entries: Array<{ value: T; count: number }>
  private _comparator: Comparator<T>
  private _totalSize: number

  constructor(options?: Partial<MultisetOptions<T>>) {
    this._comparator = options?.comparator ?? (DEFAULT_COMPARATOR as Comparator<T>)
    this._entries = []
    this._totalSize = 0
  }

  add(value: T, count: number = 1): void {
    if (count < 1) return
    const idx = this.findIndex(value)
    if (idx >= 0) {
      this._entries[idx]!.count += count
    } else {
      const insertAt = -(idx + 1)
      this._entries.splice(insertAt, 0, { value, count })
    }
    this._totalSize += count
  }

  remove(value: T, count: number = 1): number {
    if (count < 1) return 0
    const idx = this.findIndex(value)
    if (idx < 0) return 0
    const current = this._entries[idx]!.count
    const removed = Math.min(count, current)
    const remaining = current - removed
    if (remaining === 0) {
      this._entries.splice(idx, 1)
    } else {
      this._entries[idx]!.count = remaining
    }
    this._totalSize -= removed
    return removed
  }

  countOf(value: T): number {
    const idx = this.findIndex(value)
    return idx >= 0 ? this._entries[idx]!.count : 0
  }

  contains(value: T): boolean {
    return this.findIndex(value) >= 0
  }

  get min(): T | undefined {
    return this._entries.length > 0 ? this._entries[0]!.value : undefined
  }

  get max(): T | undefined {
    return this._entries.length > 0 ? this._entries[this._entries.length - 1]!.value : undefined
  }

  lowerBound(value: T): T | undefined {
    const idx = this.lowerBoundIndex(value)
    return idx < this._entries.length ? this._entries[idx]!.value : undefined
  }

  upperBound(value: T): T | undefined {
    const idx = this.upperBoundIndex(value)
    return idx < this._entries.length ? this._entries[idx]!.value : undefined
  }

  range(lower: T, upper: T): T[] {
    const result: T[] = []
    const lo = this.lowerBoundIndex(lower)
    const hi = this.upperBoundIndex(upper)
    for (let i = lo; i < hi; i++) {
      const entry = this._entries[i]!
      for (let j = 0; j < entry.count; j++) {
        result.push(entry.value)
      }
    }
    return result
  }

  forEach(callback: (value: T, count: number) => void): void {
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i]!
      callback(entry.value, entry.count)
    }
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i]!
      for (let j = 0; j < entry.count; j++) {
        result.push(entry.value)
      }
    }
    return result
  }

  get size(): number {
    return this._totalSize
  }

  get uniqueSize(): number {
    return this._entries.length
  }

  isEmpty(): boolean {
    return this._totalSize === 0
  }

  clear(): void {
    this._entries.length = 0
    this._totalSize = 0
  }

  clone(): Multiset<T> {
    const copy = new Multiset<T>({ comparator: this._comparator })
    copy._entries = this._entries.map((e) => ({ value: e.value, count: e.count }))
    copy._totalSize = this._totalSize
    return copy
  }

  static from<U>(items: Iterable<U>, options?: Partial<MultisetOptions<U>>): Multiset<U> {
    const ms = new Multiset<U>(options)
    for (const item of items) {
      ms.add(item)
    }
    return ms
  }

  union(other: Multiset<T>): Multiset<T> {
    const result = new Multiset<T>({ comparator: this._comparator })
    let i = 0
    let j = 0
    while (i < this._entries.length || j < other._entries.length) {
      if (i >= this._entries.length) {
        result._entries.push({ value: other._entries[j]!.value, count: other._entries[j]!.count })
        result._totalSize += other._entries[j]!.count
        j++
      } else if (j >= other._entries.length) {
        result._entries.push({ value: this._entries[i]!.value, count: this._entries[i]!.count })
        result._totalSize += this._entries[i]!.count
        i++
      } else {
        const cmp = this._comparator(this._entries[i]!.value, other._entries[j]!.value)
        if (cmp < 0) {
          result._entries.push({ value: this._entries[i]!.value, count: this._entries[i]!.count })
          result._totalSize += this._entries[i]!.count
          i++
        } else if (cmp > 0) {
          result._entries.push({ value: other._entries[j]!.value, count: other._entries[j]!.count })
          result._totalSize += other._entries[j]!.count
          j++
        } else {
          const c = Math.max(this._entries[i]!.count, other._entries[j]!.count)
          result._entries.push({ value: this._entries[i]!.value, count: c })
          result._totalSize += c
          i++
          j++
        }
      }
    }
    return result
  }

  intersection(other: Multiset<T>): Multiset<T> {
    const result = new Multiset<T>({ comparator: this._comparator })
    let i = 0
    let j = 0
    while (i < this._entries.length && j < other._entries.length) {
      const cmp = this._comparator(this._entries[i]!.value, other._entries[j]!.value)
      if (cmp < 0) {
        i++
      } else if (cmp > 0) {
        j++
      } else {
        const c = Math.min(this._entries[i]!.count, other._entries[j]!.count)
        if (c > 0) {
          result._entries.push({ value: this._entries[i]!.value, count: c })
          result._totalSize += c
        }
        i++
        j++
      }
    }
    return result
  }

  difference(other: Multiset<T>): Multiset<T> {
    const result = new Multiset<T>({ comparator: this._comparator })
    let i = 0
    let j = 0
    while (i < this._entries.length) {
      if (j >= other._entries.length) {
        result._entries.push({ value: this._entries[i]!.value, count: this._entries[i]!.count })
        result._totalSize += this._entries[i]!.count
        i++
      } else {
        const cmp = this._comparator(this._entries[i]!.value, other._entries[j]!.value)
        if (cmp < 0) {
          result._entries.push({ value: this._entries[i]!.value, count: this._entries[i]!.count })
          result._totalSize += this._entries[i]!.count
          i++
        } else if (cmp > 0) {
          j++
        } else {
          const c = this._entries[i]!.count - other._entries[j]!.count
          if (c > 0) {
            result._entries.push({ value: this._entries[i]!.value, count: c })
            result._totalSize += c
          }
          i++
          j++
        }
      }
    }
    return result
  }

  symmetricDifference(other: Multiset<T>): Multiset<T> {
    const result = new Multiset<T>({ comparator: this._comparator })
    let i = 0
    let j = 0
    while (i < this._entries.length || j < other._entries.length) {
      if (i >= this._entries.length) {
        result._entries.push({ value: other._entries[j]!.value, count: other._entries[j]!.count })
        result._totalSize += other._entries[j]!.count
        j++
      } else if (j >= other._entries.length) {
        result._entries.push({ value: this._entries[i]!.value, count: this._entries[i]!.count })
        result._totalSize += this._entries[i]!.count
        i++
      } else {
        const cmp = this._comparator(this._entries[i]!.value, other._entries[j]!.value)
        if (cmp < 0) {
          result._entries.push({ value: this._entries[i]!.value, count: this._entries[i]!.count })
          result._totalSize += this._entries[i]!.count
          i++
        } else if (cmp > 0) {
          result._entries.push({ value: other._entries[j]!.value, count: other._entries[j]!.count })
          result._totalSize += other._entries[j]!.count
          j++
        } else {
          const c = Math.abs(this._entries[i]!.count - other._entries[j]!.count)
          if (c > 0) {
            result._entries.push({ value: this._entries[i]!.value, count: c })
            result._totalSize += c
          }
          i++
          j++
        }
      }
    }
    return result
  }

  isSubsetOf(other: Multiset<T>): boolean {
    let i = 0
    let j = 0
    while (i < this._entries.length) {
      if (j >= other._entries.length) return false
      const cmp = this._comparator(this._entries[i]!.value, other._entries[j]!.value)
      if (cmp < 0) return false
      if (cmp > 0) {
        j++
        continue
      }
      if (this._entries[i]!.count > other._entries[j]!.count) return false
      i++
      j++
    }
    return true
  }

  isSupersetOf(other: Multiset<T>): boolean {
    return other.isSubsetOf(this)
  }

  stats(): MultisetStats<T> {
    if (this._entries.length === 0) {
      return {
        min: undefined,
        max: undefined,
        size: 0,
        uniqueSize: 0,
        minCount: 0,
        maxCount: 0,
        meanCount: 0,
      }
    }
    let minCount = Infinity
    let maxCount = -Infinity
    for (let i = 0; i < this._entries.length; i++) {
      const c = this._entries[i]!.count
      if (c < minCount) minCount = c
      if (c > maxCount) maxCount = c
    }
    return {
      min: this._entries[0]!.value,
      max: this._entries[this._entries.length - 1]!.value,
      size: this._totalSize,
      uniqueSize: this._entries.length,
      minCount,
      maxCount,
      meanCount: this._totalSize / this._entries.length,
    }
  }

  private findIndex(value: T): number {
    let lo = 0
    let hi = this._entries.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this._comparator(this._entries[mid]!.value, value)
      if (cmp < 0) lo = mid + 1
      else if (cmp > 0) hi = mid - 1
      else return mid
    }
    return -(lo + 1)
  }

  private lowerBoundIndex(value: T): number {
    let lo = 0
    let hi = this._entries.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this._comparator(this._entries[mid]!.value, value) < 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  private upperBoundIndex(value: T): number {
    let lo = 0
    let hi = this._entries.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this._comparator(this._entries[mid]!.value, value) <= 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }
}

export type { Comparator, MultisetOptions, MultisetStats } from './types.js'
export { DEFAULT_COMPARATOR } from './types.js'
