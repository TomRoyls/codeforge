import type { SparseSetOptions } from './types.js'
import { DEFAULT_SPARSE_SET_OPTIONS } from './types.js'

export class SparseSet {
  private readonly sparse: Int32Array
  private readonly dense: Int32Array
  private _size: number
  private readonly capacity: number

  constructor(capacity: number)
  constructor(options: SparseSetOptions)
  constructor(arg: number | SparseSetOptions) {
    if (typeof arg === 'number') {
      this.capacity = arg
    } else {
      this.capacity = arg.capacity ?? DEFAULT_SPARSE_SET_OPTIONS.capacity
    }
    if (this.capacity < 0) {
      throw new Error(`Capacity must be non-negative, got ${this.capacity}`)
    }
    if (!Number.isInteger(this.capacity)) {
      throw new Error(`Capacity must be an integer, got ${this.capacity}`)
    }
    this.sparse = new Int32Array(this.capacity)
    this.dense = new Int32Array(this.capacity)
    this._size = 0
  }

  add(value: number): boolean {
    if (value < 0 || value >= this.capacity || !Number.isInteger(value)) {
      return false
    }
    if (this.has(value)) {
      return false
    }
    this.sparse[value] = this._size
    this.dense[this._size] = value
    this._size++
    return true
  }

  has(value: number): boolean {
    if (value < 0 || value >= this.capacity || !Number.isInteger(value)) {
      return false
    }
    const idx = this.sparse[value]!
    return idx < this._size && this.dense[idx]! === value
  }

  delete(value: number): boolean {
    if (!this.has(value)) {
      return false
    }
    const idx = this.sparse[value]!
    const lastVal = this.dense[this._size - 1]!
    this.dense[idx] = lastVal
    this.sparse[lastVal] = idx
    this._size--
    return true
  }

  clear(): void {
    this._size = 0
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  forEach(callback: (value: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.dense[i]!)
    }
  }

  values(): number[] {
    const result: number[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.dense[i]!)
    }
    return result
  }

  toArray(): number[] {
    return this.values()
  }

  clone(): SparseSet {
    const copy = new SparseSet(this.capacity)
    copy.sparse.set(this.sparse)
    copy.dense.set(this.dense)
    copy._size = this._size
    return copy
  }

  equals(other: SparseSet): boolean {
    if (this._size !== other._size) {
      return false
    }
    for (let i = 0; i < this._size; i++) {
      if (!other.has(this.dense[i]!)) {
        return false
      }
    }
    return true
  }

  union(other: SparseSet): SparseSet {
    const result = new SparseSet(Math.max(this.capacity, other.capacity))
    for (let i = 0; i < this._size; i++) {
      result.add(this.dense[i]!)
    }
    for (let i = 0; i < other._size; i++) {
      result.add(other.dense[i]!)
    }
    return result
  }

  intersection(other: SparseSet): SparseSet {
    const result = new SparseSet(Math.max(this.capacity, other.capacity))
    const smaller = this._size <= other._size ? this : other
    const larger = this._size <= other._size ? other : this
    for (let i = 0; i < smaller._size; i++) {
      const val = smaller.dense[i]!
      if (larger.has(val)) {
        result.add(val)
      }
    }
    return result
  }

  difference(other: SparseSet): SparseSet {
    const result = new SparseSet(this.capacity)
    for (let i = 0; i < this._size; i++) {
      const val = this.dense[i]!
      if (!other.has(val)) {
        result.add(val)
      }
    }
    return result
  }

  isSubsetOf(other: SparseSet): boolean {
    if (this._size > other._size) {
      return false
    }
    for (let i = 0; i < this._size; i++) {
      if (!other.has(this.dense[i]!)) {
        return false
      }
    }
    return true
  }

  isSupersetOf(other: SparseSet): boolean {
    return other.isSubsetOf(this)
  }

  getCapacity(): number {
    return this.capacity
  }

  density(): number {
    if (this.capacity === 0) return 0
    return this._size / this.capacity
  }

  compact(): SparseSet {
    const result = new SparseSet(this._size)
    for (let i = 0; i < this._size; i++) {
      result.add(i)
    }
    return result
  }

  [Symbol.iterator](): Iterator<number> {
    let index = 0
    const dense = this.dense
    const size = this._size
    return {
      next(): IteratorResult<number> {
        if (index < size) {
          return { value: dense[index++]!, done: false }
        }
        return { value: undefined, done: true }
      },
    }
  }

  toString(): string {
    return `SparseSet({ size: ${this.size} })`
  }
}

export type { SparseSetOptions } from './types.js'
export { DEFAULT_SPARSE_SET_OPTIONS } from './types.js'
