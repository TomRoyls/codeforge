import type { Comparator, SortedArraySetOptions, SortedArraySetStats } from './types.js'
import { DEFAULT_COMPARATOR } from './types.js'

export class SortedArraySet<T = unknown> {
  private _data: T[]
  private _comparator: Comparator<T>

  constructor(options?: SortedArraySetOptions<T>) {
    this._comparator = options?.comparator ?? (DEFAULT_COMPARATOR as Comparator<T>)
    this._data = []
  }

  add(value: T): boolean {
    const idx = this.binarySearch(value)
    if (idx >= 0) return false
    const insertAt = -(idx + 1)
    this._data.splice(insertAt, 0, value)
    return true
  }

  delete(value: T): boolean {
    const idx = this.binarySearch(value)
    if (idx < 0) return false
    this._data.splice(idx, 1)
    return true
  }

  has(value: T): boolean {
    return this.binarySearch(value) >= 0
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._data.length) return undefined
    return this._data[index]
  }

  indexOf(value: T): number {
    const idx = this.binarySearch(value)
    return idx >= 0 ? idx : -1
  }

  floor(value: T): T | undefined {
    let lo = 0
    let hi = this._data.length - 1
    let result: T | undefined
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this._comparator(this._data[mid]!, value)
      if (cmp <= 0) {
        result = this._data[mid]
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return result
  }

  ceiling(value: T): T | undefined {
    let lo = 0
    let hi = this._data.length - 1
    let result: T | undefined
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this._comparator(this._data[mid]!, value)
      if (cmp >= 0) {
        result = this._data[mid]
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    return result
  }

  lower(value: T): T | undefined {
    let lo = 0
    let hi = this._data.length - 1
    let result: T | undefined
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this._comparator(this._data[mid]!, value)
      if (cmp < 0) {
        result = this._data[mid]
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return result
  }

  higher(value: T): T | undefined {
    let lo = 0
    let hi = this._data.length - 1
    let result: T | undefined
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this._comparator(this._data[mid]!, value)
      if (cmp > 0) {
        result = this._data[mid]
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    return result
  }

  range(from: T, to: T): T[] {
    if (this._data.length === 0) return []
    if (this._comparator(from, to) > 0) return []
    const lo = this.lowerBoundIndex(from)
    const hi = this.upperBoundIndex(to)
    return this._data.slice(lo, hi)
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

  get min(): T | undefined {
    return this._data.length > 0 ? this._data[0] : undefined
  }

  get max(): T | undefined {
    return this._data.length > 0 ? this._data[this._data.length - 1] : undefined
  }

  toArray(): T[] {
    return this._data.slice()
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._data.length; i++) {
      callback(this._data[i]!, i)
    }
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

  union(other: SortedArraySet<T>): SortedArraySet<T> {
    const result = new SortedArraySet<T>({ comparator: this._comparator })
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

  intersection(other: SortedArraySet<T>): SortedArraySet<T> {
    const result = new SortedArraySet<T>({ comparator: this._comparator })
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

  difference(other: SortedArraySet<T>): SortedArraySet<T> {
    const result = new SortedArraySet<T>({ comparator: this._comparator })
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

  symmetricDifference(other: SortedArraySet<T>): SortedArraySet<T> {
    const result = new SortedArraySet<T>({ comparator: this._comparator })
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

  isSubsetOf(other: SortedArraySet<T>): boolean {
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

  isSupersetOf(other: SortedArraySet<T>): boolean {
    return other.isSubsetOf(this)
  }

  stats(): SortedArraySetStats {
    return {
      size: this._data.length,
      min: this._data.length > 0 ? this._data[0] : undefined,
      max: this._data.length > 0 ? this._data[this._data.length - 1] : undefined,
    }
  }

  private binarySearch(value: T): number {
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

  toString(): string {
    return `SortedArraySet({ size: ${this.size} })`
  }
}

export type { Comparator, SortedArraySetOptions, SortedArraySetStats } from './types.js'
export { DEFAULT_COMPARATOR } from './types.js'
