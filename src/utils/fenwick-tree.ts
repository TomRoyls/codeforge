export class FenwickTree {
  private tree: Int32Array
  private _size: number

  constructor(size: number) {
    if (size < 0) throw new RangeError('Size must be non-negative')
    this._size = size
    this.tree = new Int32Array(size + 1)
  }

  update(index: number, delta: number): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    let i = index + 1
    while (i <= this._size) {
      this.tree[i]! += delta
      i += i & -i
    }
  }

  query(index: number): number {
    if (index < 0) return 0
    if (index >= this._size) index = this._size - 1
    let sum = 0
    let i = index + 1
    while (i > 0) {
      sum += this.tree[i]!
      i -= i & -i
    }
    return sum
  }

  rangeQuery(from: number, to: number): number {
    if (from > to) return 0
    const left = from <= 0 ? 0 : this.query(from - 1)
    const right = this.query(to)
    return right - left
  }

  pointQuery(index: number): number {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    return this.rangeQuery(index, index)
  }

  get size(): number {
    return this._size
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.pointQuery(i))
    }
    return result
  }

  reset(): void {
    this.tree.fill(0)
  }

  toString(): string {
    return JSON.stringify(Array.from(this.tree))
  }

  toJSON(): number[] {
    return Array.from(this.tree)
  }

  equals(other: unknown): boolean {
    if (!(other instanceof FenwickTree)) return false
    if (this._size !== other._size) return false
    if (this.tree.length !== other.tree.length) return false
    for (let i = 0; i < this.tree.length; i++) {
      if (this.tree[i] !== other.tree[i]) return false
    }
    return true
  }

  clone(): FenwickTree {
    const copy = new FenwickTree(this._size)
    copy.tree = new Int32Array(this.tree)
    return copy
  }

  static fromArray(values: number[]): FenwickTree {
    const ft = new FenwickTree(values.length)
    for (let i = 0; i < values.length; i++) {
      ft.update(i, values[i]!)
    }
    return ft
  }
}
