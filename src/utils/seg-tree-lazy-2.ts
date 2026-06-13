export class SegTreeLazy2 {
  private tree: number[]
  private lazy: number[]
  private n: number

  constructor(arr: number[]) {
    this.n = arr.length
    const size = Math.max(1, 4 * arr.length)
    this.tree = new Array(size).fill(0)
    this.lazy = new Array(size).fill(0)
    if (arr.length > 0) this.build(arr, 1, 0, this.n - 1)
  }

  private build(arr: number[], node: number, start: number, end: number): void {
    if (start === end) { this.tree[node] = arr[start]!; return }
    const mid = (start + end) >> 1
    this.build(arr, 2 * node, start, mid)
    this.build(arr, 2 * node + 1, mid + 1, end)
    this.tree[node] = Math.min(this.tree[2 * node]!, this.tree[2 * node + 1]!)
  }

  updateRange(l: number, r: number, val: number): void {
    this._update(1, 0, this.n - 1, l, r, val)
  }

  private _update(node: number, start: number, end: number, l: number, r: number, val: number): void {
    if (this.lazy[node] !== 0) {
      this.tree[node] += this.lazy[node]
      if (start !== end) { this.lazy[2 * node]! += this.lazy[node]!; this.lazy[2 * node + 1]! += this.lazy[node]! }
      this.lazy[node] = 0
    }
    if (start > r || end < l) return
    if (start >= l && end <= r) {
      this.tree[node] += val
      if (start !== end) { this.lazy[2 * node]! += val; this.lazy[2 * node + 1]! += val }
      return
    }
    const mid = (start + end) >> 1
    this._update(2 * node, start, mid, l, r, val)
    this._update(2 * node + 1, mid + 1, end, l, r, val)
    this.tree[node] = Math.min(this.tree[2 * node]!, this.tree[2 * node + 1]!)
  }

  rangeMin(l: number, r: number): number {
    return this._query(1, 0, this.n - 1, l, r)
  }

  private _query(node: number, start: number, end: number, l: number, r: number): number {
    if (start > r || end < l) return Infinity
    if (this.lazy[node] !== 0) {
      this.tree[node] += this.lazy[node]
      if (start !== end) { this.lazy[2 * node]! += this.lazy[node]!; this.lazy[2 * node + 1]! += this.lazy[node]! }
      this.lazy[node] = 0
    }
    if (start >= l && end <= r) return this.tree[node]!
    const mid = (start + end) >> 1
    return Math.min(this._query(2 * node, start, mid, l, r), this._query(2 * node + 1, mid + 1, end, l, r))
  }

  get size(): number { return this.n }
  get isEmpty(): boolean { return this.n === 0 }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this.n; i++) result.push(this.rangeMin(i, i))
    return result
  }

  toString(): string { return JSON.stringify({ size: this.n }) }
  toJSON(): Record<string, number> { return { size: this.n } }

  clone(): SegTreeLazy2 {
    return new SegTreeLazy2(this.toArray())
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SegTreeLazy2)) return false
    return this.n === other.n
  }
}
