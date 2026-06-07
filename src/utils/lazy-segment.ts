export class LazySegmentTree {
  private n: number
  private tree: number[]
  private lazy: number[]
  private combine: (a: number, b: number) => number
  private applyLazy: (value: number, lazy: number, len: number) => number
  private composeLazy: (existing: number, newLazy: number) => number

  constructor(
    n: number,
    combine: (a: number, b: number) => number = (a, b) => a + b,
    applyLazy: (value: number, lazy: number, len: number) => number = (v, l, _n) => v + l * _n,
    composeLazy: (existing: number, newLazy: number) => number = (e, n) => e + n,
  ) {
    this.n = n
    this.combine = combine
    this.applyLazy = applyLazy
    this.composeLazy = composeLazy
    this.tree = new Array(4 * n).fill(0)
    this.lazy = new Array(4 * n).fill(0)
  }

  updateRange(l: number, r: number, value: number): void {
    this.update(1, 0, this.n - 1, l, r, value)
  }

  private update(node: number, nl: number, nr: number, ql: number, qr: number, value: number): void {
    this.push(node, nl, nr)
    if (ql > nr || qr < nl) return
    if (ql <= nl && nr <= qr) {
      this.lazy[node] = this.composeLazy(this.lazy[node]!, value)
      this.push(node, nl, nr)
      return
    }
    const mid = (nl + nr) >> 1
    this.update(node * 2, nl, mid, ql, qr, value)
    this.update(node * 2 + 1, mid + 1, nr, ql, qr, value)
    this.tree[node] = this.combine(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  queryRange(l: number, r: number): number {
    return this.query(1, 0, this.n - 1, l, r)
  }

  private query(node: number, nl: number, nr: number, ql: number, qr: number): number {
    this.push(node, nl, nr)
    if (ql > nr || qr < nl) return 0
    if (ql <= nl && nr <= qr) return this.tree[node]!
    const mid = (nl + nr) >> 1
    return this.combine(
      this.query(node * 2, nl, mid, ql, qr),
      this.query(node * 2 + 1, mid + 1, nr, ql, qr),
    )
  }

  private push(node: number, l: number, r: number): void {
    if (this.lazy[node] === 0) return
    const len = r - l + 1
    this.tree[node] = this.applyLazy(this.tree[node]!, this.lazy[node]!, len)
    if (l !== r) {
      this.lazy[node * 2] = this.composeLazy(this.lazy[node * 2]!, this.lazy[node]!)
      this.lazy[node * 2 + 1] = this.composeLazy(this.lazy[node * 2 + 1]!, this.lazy[node]!)
    }
    this.lazy[node] = 0
  }

  setPoint(idx: number, value: number): void {
    this.updateRange(idx, idx, value)
  }

  getPoint(idx: number): number {
    return this.queryRange(idx, idx)
  }

  toString(): string {
    return `LazySegmentTree(${this.n})`
  }

  toJSON(): unknown {
    const arr: number[] = []
    for (let i = 0; i < this.n; i++) arr.push(this.queryRange(i, i))
    return arr
  }

  clone(): LazySegmentTree {
    const copy = new LazySegmentTree(
      this.n,
      this.combine,
      this.applyLazy,
      this.composeLazy,
    )
    for (let i = 0; i < this.n; i++) {
      copy.updateRange(i, i, this.queryRange(i, i))
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof LazySegmentTree)) return false
    if (this.n !== other.n) return false
    for (let i = 0; i < this.n; i++) {
      if (this.queryRange(i, i) !== other.queryRange(i, i)) return false
    }
    return true
  }
}
