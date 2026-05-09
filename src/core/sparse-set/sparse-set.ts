import type { SparseSetOptions } from './types.js'
import { DEFAULT_SPARSE_SET_OPTIONS } from './types.js'

export class SparseSet {
  private readonly sparse: Int32Array
  private readonly dense: Int32Array
  private _size: number
  private readonly universeSize: number

  constructor(universeSize: number)
  constructor(options: SparseSetOptions)
  constructor(arg: number | SparseSetOptions) {
    if (typeof arg === 'number') {
      this.universeSize = arg
    } else {
      this.universeSize = arg.universeSize ?? DEFAULT_SPARSE_SET_OPTIONS.universeSize
    }
    if (this.universeSize < 0) {
      throw new Error(`Universe size must be non-negative, got ${this.universeSize}`)
    }
    if (!Number.isInteger(this.universeSize)) {
      throw new Error(`Universe size must be an integer, got ${this.universeSize}`)
    }
    this.sparse = new Int32Array(this.universeSize)
    this.dense = new Int32Array(this.universeSize)
    this._size = 0
  }

  add(value: number): boolean {
    if (value < 0 || value >= this.universeSize || !Number.isInteger(value)) {
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
    if (value < 0 || value >= this.universeSize || !Number.isInteger(value)) {
      return false
    }
    const idx = this.sparse[value]!
    return idx < this._size && this.dense[idx]! === value
  }

  remove(value: number): boolean {
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

  clone(): SparseSet {
    const copy = new SparseSet(this.universeSize)
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
    const result = new SparseSet(Math.max(this.universeSize, other.universeSize))
    for (let i = 0; i < this._size; i++) {
      result.add(this.dense[i]!)
    }
    for (let i = 0; i < other._size; i++) {
      result.add(other.dense[i]!)
    }
    return result
  }

  intersection(other: SparseSet): SparseSet {
    const result = new SparseSet(Math.max(this.universeSize, other.universeSize))
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
    const result = new SparseSet(this.universeSize)
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

  isDisjointFrom(other: SparseSet): boolean {
    const smaller = this._size <= other._size ? this : other
    const larger = this._size <= other._size ? other : this
    for (let i = 0; i < smaller._size; i++) {
      if (larger.has(smaller.dense[i]!)) {
        return false
      }
    }
    return true
  }

  getUniverseSize(): number {
    return this.universeSize
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
    const vals = this.values().sort((a, b) => a - b)
    return `SparseSet{${vals.join(', ')}}`
  }
}

export type { SparseSetOptions } from './types.js'
export { DEFAULT_SPARSE_SET_OPTIONS } from './types.js'
