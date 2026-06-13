export class SegmentTree {
  private tree: number[]
  private n: number
  private op: (a: number, b: number) => number

  constructor(data: number[], op: (a: number, b: number) => number = (a, b) => Math.min(a, b)) {
    this.op = op
    this.n = data.length
    this.tree = new Array(2 * this.n).fill(0)
    for (let i = 0; i < this.n; i++) this.tree[this.n + i] = data[i]!
    for (let i = this.n - 1; i > 0; i--) this.tree[i] = this.op(this.tree[2 * i]!, this.tree[2 * i + 1]!)
  }

  update(index: number, value: number): void {
    let pos = index + this.n
    this.tree[pos] = value
    while (pos > 1) {
      pos >>= 1
      this.tree[pos] = this.op(this.tree[2 * pos]!, this.tree[2 * pos + 1]!)
    }
  }

  query(left: number, right: number): number {
    let result = 0
    let l = left + this.n
    let r = right + this.n
    let started = false
    while (l < r) {
      if (l & 1) { result = started ? this.op(result, this.tree[l]!) : (started = true, this.tree[l]!); l++ }
      if (r & 1) { r--; result = started ? this.op(result, this.tree[r]!) : (started = true, this.tree[r]!) }
      l >>= 1; r >>= 1
    }
    return result
  }

  get length(): number { return this.n }
  get isEmpty(): boolean { return this.n === 0 }

  clear(): void { this.tree = new Array(2 * this.n).fill(0) }

  toArray(): number[] { return this.tree.slice(this.n) }
  toString(): string { return JSON.stringify({ length: this.n }) }
  toJSON(): Record<string, number> { return { length: this.n } }

  clone(): SegmentTree {
    return new SegmentTree(this.toArray(), this.op)
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SegmentTree)) return false
    return this.n === other.n
  }
}
