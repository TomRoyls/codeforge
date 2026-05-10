import type { StaticSparseSetOptions, StaticSparseSetStatistics } from './types.js'
import { DEFAULT_STATIC_SPARSE_SET_OPTIONS } from './types.js'

export class StaticSparseSet {
  private readonly sparse: Int32Array
  private readonly dense: Int32Array
  private _size: number
  private readonly universeSize: number
  private stats: { inserts: number; deletes: number; lookups: number; iterations: number; denseArrayMoves: number }

  constructor(options?: Partial<StaticSparseSetOptions>) {
    const resolved = { ...DEFAULT_STATIC_SPARSE_SET_OPTIONS, ...options }
    this.universeSize = resolved.universeSize
    if (this.universeSize < 0) {
      throw new Error(`Universe size must be non-negative, got ${this.universeSize}`)
    }
    if (!Number.isInteger(this.universeSize)) {
      throw new Error(`Universe size must be an integer, got ${this.universeSize}`)
    }
    this.sparse = new Int32Array(this.universeSize)
    this.dense = new Int32Array(this.universeSize)
    this._size = 0
    this.stats = { inserts: 0, deletes: 0, lookups: 0, iterations: 0, denseArrayMoves: 0 }
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
    this.stats.inserts++
    return true
  }

  delete(value: number): boolean {
    if (!this.has(value)) {
      return false
    }
    const idx = this.sparse[value]!
    const lastIdx = this._size - 1
    if (idx !== lastIdx) {
      const lastVal = this.dense[lastIdx]!
      this.dense[idx] = lastVal
      this.sparse[lastVal] = idx
      this.stats.denseArrayMoves++
    }
    this._size--
    this.stats.deletes++
    return true
  }

  has(value: number): boolean {
    this.stats.lookups++
    if (value < 0 || value >= this.universeSize || !Number.isInteger(value)) {
      return false
    }
    const idx = this.sparse[value]!
    return idx < this._size && this.dense[idx]! === value
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._size = 0
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.dense[i]!)
    }
    return result
  }

  forEach(callback: (value: number) => void): void {
    this.stats.iterations++
    for (let i = 0; i < this._size; i++) {
      callback(this.dense[i]!)
    }
  }

  [Symbol.iterator](): Iterator<number> {
    this.stats.iterations++
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

  union(other: StaticSparseSet): StaticSparseSet {
    const result = new StaticSparseSet({ universeSize: Math.max(this.universeSize, other.universeSize) })
    for (let i = 0; i < this._size; i++) {
      result.add(this.dense[i]!)
    }
    for (let i = 0; i < other._size; i++) {
      result.add(other.dense[i]!)
    }
    return result
  }

  intersection(other: StaticSparseSet): StaticSparseSet {
    const result = new StaticSparseSet({ universeSize: Math.max(this.universeSize, other.universeSize) })
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

  difference(other: StaticSparseSet): StaticSparseSet {
    const result = new StaticSparseSet({ universeSize: this.universeSize })
    for (let i = 0; i < this._size; i++) {
      const val = this.dense[i]!
      if (!other.has(val)) {
        result.add(val)
      }
    }
    return result
  }

  isSubsetOf(other: StaticSparseSet): boolean {
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

  isSupersetOf(other: StaticSparseSet): boolean {
    return other.isSubsetOf(this)
  }

  clone(): StaticSparseSet {
    const copy = new StaticSparseSet({ universeSize: this.universeSize })
    copy.sparse.set(this.sparse)
    copy.dense.set(this.dense)
    copy._size = this._size
    copy.stats = { ...this.stats }
    return copy
  }

  getUniverseSize(): number {
    return this.universeSize
  }

  getStatistics(): StaticSparseSetStatistics {
    return { ...this.stats }
  }
}

export type { StaticSparseSetOptions, StaticSparseSetStatistics } from './types.js'
export { DEFAULT_STATIC_SPARSE_SET_OPTIONS } from './types.js'
