import type { Comparator, SortedSetOptions, SortedSetStats } from './types.js'
import { DEFAULT_COMPARATOR } from './types.js'

export class SortedSet<T = unknown> {
  private _data: T[]
  private _comparator: Comparator<T>

  constructor(options?: SortedSetOptions<T>) {
    this._comparator = options?.comparator ?? (DEFAULT_COMPARATOR as Comparator<T>)
    this._data = []
  }

  add(value: T): void {
    const idx = this.findIndex(value)
    if (idx >= 0) return
    const insertAt = -(idx + 1)
    this._data.splice(insertAt, 0, value)
  }

  delete(value: T): boolean {
    const idx = this.findIndex(value)
    if (idx < 0) return false
    this._data.splice(idx, 1)
    return true
  }

  has(value: T): boolean {
    return this.findIndex(value) >= 0
  }

  get min(): T | undefined {
    return this._data.length > 0 ? this._data[0] : undefined
  }

  get max(): T | undefined {
    return this._data.length > 0 ? this._data[this._data.length - 1] : undefined
  }

  lowerBound(value: T): T | undefined {
    const idx = this.lowerBoundIndex(value)
    return idx < this._data.length ? this._data[idx] : undefined
  }

  upperBound(value: T): T | undefined {
    const idx = this.upperBoundIndex(value)
    return idx < this._data.length ? this._data[idx] : undefined
  }

  range(lower: T, upper: T): T[] {
    if (this._data.length === 0) return []
    if (this._comparator(lower, upper) > 0) return []
    const lo = this.lowerBoundIndex(lower)
    const hi = this.upperBoundIndex(upper)
    return this._data.slice(lo, hi)
  }

  forEach(callback: (value: T) => void): void {
    for (let i = 0; i < this._data.length; i++) {
      callback(this._data[i]!)
    }
  }

  toArray(): T[] {
    return this._data.slice()
  }

  get size(): number {
    return this._data.length
  }

  isEmpty(): boolean {
    return this._data.length === 0
  }

  clear(): void {
    this._data.length = 0
  }

  clone(): SortedSet<T> {
    const copy = new SortedSet<T>({ comparator: this._comparator })
    copy._data = this._data.slice()
    return copy
  }

  static from<U>(items: Iterable<U>, options?: SortedSetOptions<U>): SortedSet<U> {
    const set = new SortedSet<U>(options)
    for (const item of items) {
      set.add(item)
    }
    return set
  }

  union(other: SortedSet<T>): SortedSet<T> {
    const result = new SortedSet<T>({ comparator: this._comparator })
    let i = 0
    let j = 0
    while (i < this._data.length || j < other._data.length) {
      if (i >= this._data.length) {
        result._data.push(other._data[j]!)
        j++
      } else if (j >= other._data.length) {
        result._data.push(this._data[i]!)
        i++
      } else {
        const cmp = this._comparator(this._data[i]!, other._data[j]!)
        if (cmp < 0) {
          result._data.push(this._data[i]!)
          i++
        } else if (cmp > 0) {
          result._data.push(other._data[j]!)
          j++
        } else {
          result._data.push(this._data[i]!)
          i++
          j++
        }
      }
    }
    return result
  }

  intersection(other: SortedSet<T>): SortedSet<T> {
    const result = new SortedSet<T>({ comparator: this._comparator })
    let i = 0
    let j = 0
    while (i < this._data.length && j < other._data.length) {
      const cmp = this._comparator(this._data[i]!, other._data[j]!)
      if (cmp < 0) {
        i++
      } else if (cmp > 0) {
        j++
      } else {
        result._data.push(this._data[i]!)
        i++
        j++
      }
    }
    return result
  }

  difference(other: SortedSet<T>): SortedSet<T> {
    const result = new SortedSet<T>({ comparator: this._comparator })
    let i = 0
    let j = 0
    while (i < this._data.length) {
      if (j >= other._data.length) {
        result._data.push(this._data[i]!)
        i++
      } else {
        const cmp = this._comparator(this._data[i]!, other._data[j]!)
        if (cmp < 0) {
          result._data.push(this._data[i]!)
          i++
        } else if (cmp > 0) {
          j++
        } else {
          i++
          j++
        }
      }
    }
    return result
  }

  symmetricDifference(other: SortedSet<T>): SortedSet<T> {
    const result = new SortedSet<T>({ comparator: this._comparator })
    let i = 0
    let j = 0
    while (i < this._data.length || j < other._data.length) {
      if (i >= this._data.length) {
        result._data.push(other._data[j]!)
        j++
      } else if (j >= other._data.length) {
        result._data.push(this._data[i]!)
        i++
      } else {
        const cmp = this._comparator(this._data[i]!, other._data[j]!)
        if (cmp < 0) {
          result._data.push(this._data[i]!)
          i++
        } else if (cmp > 0) {
          result._data.push(other._data[j]!)
          j++
        } else {
          i++
          j++
        }
      }
    }
    return result
  }

  isSubsetOf(other: SortedSet<T>): boolean {
    if (this._data.length === 0) return true
    let i = 0
    let j = 0
    while (i < this._data.length && j < other._data.length) {
      const cmp = this._comparator(this._data[i]!, other._data[j]!)
      if (cmp < 0) return false
      if (cmp > 0) {
        j++
      } else {
        i++
        j++
      }
    }
    return i === this._data.length
  }

  isSupersetOf(other: SortedSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  isDisjointFrom(other: SortedSet<T>): boolean {
    let i = 0
    let j = 0
    while (i < this._data.length && j < other._data.length) {
      const cmp = this._comparator(this._data[i]!, other._data[j]!)
      if (cmp < 0) {
        i++
      } else if (cmp > 0) {
        j++
      } else {
        return false
      }
    }
    return true
  }

  indexOf(value: T): number {
    const idx = this.findIndex(value)
    return idx >= 0 ? idx : -1
  }

  atIndex(index: number): T | undefined {
    if (index < 0 || index >= this._data.length) return undefined
    return this._data[index]
  }

  stats(): SortedSetStats {
    return {
      size: this._data.length,
      min: this._data.length > 0 ? this._data[0] : undefined,
      max: this._data.length > 0 ? this._data[this._data.length - 1] : undefined,
    }
  }

  private findIndex(value: T): number {
    let lo = 0
    let hi = this._data.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this._comparator(this._data[mid]!, value)
      if (cmp < 0) lo = mid + 1
      else if (cmp > 0) hi = mid - 1
      else return mid
    }
    return -(lo + 1)
  }

  private lowerBoundIndex(value: T): number {
    let lo = 0
    let hi = this._data.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this._comparator(this._data[mid]!, value) < 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  private upperBoundIndex(value: T): number {
    let lo = 0
    let hi = this._data.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this._comparator(this._data[mid]!, value) <= 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const data = this._data
    return {
      next: () => {
        if (index < data.length) {
          const value = data[index]!
          index++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<T>
      },
    }
  }
}

export type { Comparator, SortedSetOptions, SortedSetStats } from './types.js'
export { DEFAULT_COMPARATOR } from './types.js'
