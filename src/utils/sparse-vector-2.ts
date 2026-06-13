export class SparseVector2 {
  private data = new Map<number, number>()
  private dimension: number

  constructor(dimension: number) {
    this.dimension = dimension
  }

  set(index: number, value: number): void {
    if (value === 0) this.data.delete(index)
    else this.data.set(index, value)
  }

  get(index: number): number {
    return this.data.get(index) ?? 0
  }

  dot(other: SparseVector2): number {
    let result = 0
    const [smaller, larger] = this.data.size < other.data.size
      ? [this, other] : [other, this]
    for (const [idx, val] of smaller.data) {
      result += val * (larger.get(idx))
    }
    return result
  }

  add(other: SparseVector2): SparseVector2 {
    const result = new SparseVector2(this.dimension)
    for (const [idx, val] of this.data) result.set(idx, val + other.get(idx))
    for (const [idx, val] of other.data) if (!this.data.has(idx)) result.set(idx, val)
    return result
  }

  scale(scalar: number): SparseVector2 {
    const result = new SparseVector2(this.dimension)
    for (const [idx, val] of this.data) result.set(idx, val * scalar)
    return result
  }

  norm(): number {
    let sum = 0
    for (const val of this.data.values()) sum += val * val
    return Math.sqrt(sum)
  }

  get nnz(): number { return this.data.size }
  get dim(): number { return this.dimension }

  toDense(): number[] {
    const result = new Array(this.dimension).fill(0)
    for (const [idx, val] of this.data) result[idx] = val
    return result
  }

  clear(): void { this.data.clear() }

  toArray(): number[] { return this.toDense() }
  toString(): string { return JSON.stringify({ dim: this.dimension, nnz: this.nnz }) }
  toJSON(): Record<string, number> { return { dim: this.dimension, nnz: this.nnz } }
  clone(): SparseVector2 {
    const c = new SparseVector2(this.dimension)
    for (const [idx, val] of this.data) c.set(idx, val)
    return c
  }
  equals(other: unknown): boolean { return other instanceof SparseVector2 }
}
