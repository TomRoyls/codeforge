export class SegmentTree {
  private tree: number[]
  private _size: number
  private operation: (a: number, b: number) => number
  private identity: number

  constructor(
    size: number,
    operation: (a: number, b: number) => number = Math.min,
    identity: number = Infinity,
  ) {
    if (size < 0) throw new RangeError('Size must be non-negative')
    this._size = size
    this.operation = operation
    this.identity = identity
    this.tree = new Array(size * 4).fill(identity)
  }

  update(index: number, value: number): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    this.updateInternal(1, 0, this._size - 1, index, value)
  }

  query(from: number, to: number): number {
    if (from > to) return this.identity
    from = Math.max(0, from)
    to = Math.min(this._size - 1, to)
    if (from >= this._size || to < 0) return this.identity
    return this.queryInternal(1, 0, this._size - 1, from, to)
  }

  get size(): number {
    return this._size
  }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.query(i, i))
    }
    return result
  }

  reset(): void {
    this.tree.fill(this.identity)
  }

  toString(): string {
    return JSON.stringify([...this.tree])
  }

  toJSON(): number[] {
    return [...this.tree]
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SegmentTree)) return false
    if (this._size !== other._size) return false
    if (this.identity !== other.identity) return false
    if (this.tree.length !== other.tree.length) return false
    for (let i = 0; i < this.tree.length; i++) {
      if (this.tree[i] !== other.tree[i]) return false
    }
    return true
  }

  clone(): SegmentTree {
    const copy = new SegmentTree(this._size, this.operation, this.identity)
    copy.tree = [...this.tree]
    return copy
  }

  static fromArray(
    values: number[],
    operation: (a: number, b: number) => number = Math.min,
    identity: number = Infinity,
  ): SegmentTree {
    const st = new SegmentTree(values.length, operation, identity)
    for (let i = 0; i < values.length; i++) {
      st.update(i, values[i]!)
    }
    return st
  }

  private updateInternal(node: number, left: number, right: number, index: number, value: number): void {
    if (left === right) {
      this.tree[node] = value
      return
    }
    const mid = Math.floor((left + right) / 2)
    if (index <= mid) {
      this.updateInternal(node * 2, left, mid, index, value)
    } else {
      this.updateInternal(node * 2 + 1, mid + 1, right, index, value)
    }
    this.tree[node] = this.operation(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  private queryInternal(node: number, left: number, right: number, from: number, to: number): number {
    if (from > right || to < left) return this.identity
    if (from <= left && right <= to) return this.tree[node]!
    const mid = Math.floor((left + right) / 2)
    const leftResult = this.queryInternal(node * 2, left, mid, from, to)
    const rightResult = this.queryInternal(node * 2 + 1, mid + 1, right, from, to)
    return this.operation(leftResult, rightResult)
  }
}
