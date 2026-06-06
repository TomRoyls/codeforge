export class SparseSet {
  private dense: number[]
  private sparse: number[]
  private n: number
  private _universe: number

  constructor(universe: number) {
    if (!Number.isInteger(universe) || universe < 0) {
      throw new RangeError(`Universe size must be a non-negative integer, got ${universe}`)
    }
    this.dense = []
    this.sparse = new Array(universe).fill(-1)
    this.n = 0
    this._universe = universe
  }

  get universeSize(): number {
    return this._universe
  }

  get isEmpty(): boolean {
    return this.n === 0
  }

  has(x: number): boolean {
    if (x < 0 || x >= this._universe) return false
    const idx = this.sparse[x]!
    return idx >= 0 && idx < this.n && this.dense[idx] === x
  }

  add(x: number): boolean {
    if (x < 0 || x >= this._universe || !Number.isInteger(x)) return false
    if (this.has(x)) return false
    this.sparse[x] = this.n
    this.dense[this.n] = x
    this.n++
    return true
  }

  remove(x: number): boolean {
    if (!this.has(x)) return false
    const idx = this.sparse[x]!
    const last = this.dense[this.n - 1]!
    this.dense[idx] = last
    this.sparse[last] = idx
    this.n--
    return true
  }

  clear(): void {
    this.n = 0
  }

  get size(): number {
    return this.n
  }

  values(): number[] {
    return this.dense.slice(0, this.n)
  }

  toArray(): number[] {
    return this.dense.slice(0, this.n)
  }

  union(other: SparseSet): SparseSet {
    const result = new SparseSet(Math.max(this._universe, other._universe))
    for (const v of this) result.add(v)
    for (const v of other) result.add(v)
    return result
  }

  intersection(other: SparseSet): SparseSet {
    const result = new SparseSet(Math.min(this._universe, other._universe))
    for (const v of this) {
      if (other.has(v)) result.add(v)
    }
    return result
  }

  difference(other: SparseSet): SparseSet {
    const result = new SparseSet(this._universe)
    for (const v of this) {
      if (!other.has(v)) result.add(v)
    }
    return result
  }

  isSubsetOf(other: SparseSet): boolean {
    if (this._universe > other._universe) return false
    for (const v of this) {
      if (!other.has(v)) return false
    }
    return true
  }

  isSupersetOf(other: SparseSet): boolean {
    return other.isSubsetOf(this)
  }

  equals(other: SparseSet): boolean {
    if (this.n !== other.n) return false
    for (const v of this) {
      if (!other.has(v)) return false
    }
    return true
  }

  clone(): SparseSet {
    const result = new SparseSet(this._universe)
    for (const v of this) result.add(v)
    return result
  }

  forEach(callback: (value: number, index: number) => void): void {
    for (let i = 0; i < this.n; i++) {
      callback(this.dense[i]!, i)
    }
  }

  [Symbol.iterator](): Iterator<number> {
    let i = 0
    const self = this
    return {
      next(): IteratorResult<number> {
        if (i < self.n) return { value: self.dense[i++]!, done: false }
        return { value: undefined, done: true } as IteratorResult<number>
      },
    }
  }
}
