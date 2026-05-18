/**
 * SparseSet - O(1) add/remove/contains/iterate for non-negative integers.
 *
 * Uses a pair of arrays (sparse/dense) to achieve constant-time operations
 * while maintaining dense iteration order. Memory usage is O(universe_size)
 * for the sparse array and O(n) for the dense array.
 *
 * Ideal when the integer universe is bounded and iteration order doesn't matter.
 */
export class SparseSet {
  private readonly sparse: Int32Array
  private readonly dense: Int32Array
  private _size: number = 0

  constructor(universeSize: number) {
    if (!Number.isInteger(universeSize) || universeSize < 0) {
      throw new RangeError(`Universe size must be a non-negative integer, got ${universeSize}`)
    }
    this.sparse = new Int32Array(universeSize).fill(-1)
    this.dense = new Int32Array(universeSize)
  }

  add(value: number): boolean {
    if (!Number.isInteger(value) || value < 0 || value >= this.sparse.length) {
      return false
    }
    if (this.has(value)) {
      return false
    }
    this.dense[this._size] = value
    this.sparse[value] = this._size
    this._size++
    return true
  }

  has(value: number): boolean {
    if (!Number.isInteger(value) || value < 0 || value >= this.sparse.length) {
      return false
    }
    const idx = this.sparse[value]!
    return idx >= 0 && idx < this._size && this.dense[idx]! === value
  }

  remove(value: number): boolean {
    if (!this.has(value)) {
      return false
    }
    const idx = this.sparse[value]!
    const lastDense = this.dense[this._size - 1]!
    if (idx !== this._size - 1) {
      this.dense[idx]! = lastDense
      this.sparse[lastDense]! = idx
    }
    this.sparse[value] = -1
    this._size--
    return true
  }

  clear(): void {
    this._size = 0
    this.sparse.fill(-1)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get universeSize(): number {
    return this.sparse.length
  }

  values(): number[] {
    return Array.from(this.dense.subarray(0, this._size))
  }

  forEach(callback: (value: number, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.dense[i]!, i)
    }
  }

  [Symbol.iterator](): Iterator<number> {
    let i = 0
    return {
      next: () => {
        if (i < this._size) {
          return { value: this.dense[i++]!, done: false }
        }
        return { value: undefined as unknown as number, done: true }
      },
    }
  }

  union(other: SparseSet): SparseSet {
    const maxSize = Math.max(this.sparse.length, other.sparse.length)
    const result = new SparseSet(maxSize)
    this.forEach((v) => result.add(v))
    other.forEach((v) => result.add(v))
    return result
  }

  intersection(other: SparseSet): SparseSet {
    const [smaller, larger] = this._size <= other._size ? [this, other] : [other, this]
    const maxSize = Math.max(this.sparse.length, other.sparse.length)
    const result = new SparseSet(maxSize)
    smaller.forEach((v) => {
      if (larger.has(v)) {
        result.add(v)
      }
    })
    return result
  }

  difference(other: SparseSet): SparseSet {
    const result = new SparseSet(this.sparse.length)
    this.forEach((v) => {
      if (!other.has(v)) {
        result.add(v)
      }
    })
    return result
  }

  isSubsetOf(other: SparseSet): boolean {
    if (this._size > other._size) return false
    let allFound = true
    this.forEach((v) => {
      if (!other.has(v)) allFound = false
    })
    return allFound
  }

  isSupersetOf(other: SparseSet): boolean {
    return other.isSubsetOf(this)
  }

  equals(other: SparseSet): boolean {
    if (this._size !== other._size) return false
    let allFound = true
    this.forEach((v) => {
      if (!other.has(v)) allFound = false
    })
    return allFound
  }

  clone(): SparseSet {
    const result = new SparseSet(this.sparse.length)
    this.forEach((v) => result.add(v))
    return result
  }

  toArray(): number[] {
    return this.values()
  }
}
