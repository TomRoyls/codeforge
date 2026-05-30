export class LazySegmentTree {
  private n: number
  private tree: number[]
  private lazy: number[]

  constructor(data: number[]) {
    this.n = data.length
    this.tree = new Array(4 * this.n).fill(0)
    this.lazy = new Array(4 * this.n).fill(0)
    if (this.n > 0) this.build(data, 1, 0, this.n - 1)
  }

  rangeUpdate(l: number, r: number, val: number): void {
    this.update(1, 0, this.n - 1, l, r, val)
  }

  rangeQuery(l: number, r: number): number {
    return this.query(1, 0, this.n - 1, l, r)
  }

  pointQuery(idx: number): number {
    return this.rangeQuery(idx, idx)
  }

  pointUpdate(idx: number, val: number): void {
    this.rangeUpdate(idx, idx, val)
  }

  get length(): number {
    return this.n
  }

  private build(data: number[], node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = data[start]!
      return
    }
    const mid = (start + end) >> 1
    this.build(data, node * 2, start, mid)
    this.build(data, node * 2 + 1, mid + 1, end)
    this.tree[node] = this.tree[node * 2]! + this.tree[node * 2 + 1]!
  }

  private pushDown(node: number, start: number, end: number): void {
    const lazyVal = this.lazy[node] ?? 0
    if (lazyVal !== 0) {
      const mid = (start + end) >> 1
      const left = node * 2
      const right = node * 2 + 1
      this.tree[left] = (this.tree[left] ?? 0) + lazyVal * (mid - start + 1)
      this.tree[right] = (this.tree[right] ?? 0) + lazyVal * (end - mid)
      this.lazy[left] = (this.lazy[left] ?? 0) + lazyVal
      this.lazy[right] = (this.lazy[right] ?? 0) + lazyVal
      this.lazy[node] = 0
    }
  }

  private update(node: number, start: number, end: number, l: number, r: number, val: number): void {
    if (r < start || l > end) return
    if (l <= start && end <= r) {
      this.tree[node] = (this.tree[node] ?? 0) + val * (end - start + 1)
      this.lazy[node] = (this.lazy[node] ?? 0) + val
      return
    }
    this.pushDown(node, start, end)
    const mid = (start + end) >> 1
    this.update(node * 2, start, mid, l, r, val)
    this.update(node * 2 + 1, mid + 1, end, l, r, val)
    this.tree[node] = this.tree[node * 2]! + this.tree[node * 2 + 1]!
  }

  private query(node: number, start: number, end: number, l: number, r: number): number {
    if (r < start || l > end) return 0
    if (l <= start && end <= r) return this.tree[node]!
    this.pushDown(node, start, end)
    const mid = (start + end) >> 1
    return this.query(node * 2, start, mid, l, r) + this.query(node * 2 + 1, mid + 1, end, l, r)
  }
}
