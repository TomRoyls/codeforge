export class LazySegmentTree3 {
  private tree: number[];
  private lazy: number[];
  private n: number;

  constructor(data: number[]) {
    this.n = data.length;
    const size = 4 * this.n;
    this.tree = new Array(size).fill(0);
    this.lazy = new Array(size).fill(0);
    this.build(data, 0, 0, this.n - 1);
  }

  private build(data: number[], node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = data[start]!;
      return;
    }
    const mid = Math.floor((start + end) / 2);
    this.build(data, 2 * node + 1, start, mid);
    this.build(data, 2 * node + 2, mid + 1, end);
    this.tree[node] = this.tree[2 * node + 1]! + this.tree[2 * node + 2]!;
  }

  private pushDown(node: number, start: number, end: number): void {
    if (this.lazy[node] !== 0) {
      const mid = Math.floor((start + end) / 2);
      const leftChild = 2 * node + 1;
      const rightChild = 2 * node + 2;
      const lazyValue = this.lazy[node]!;
      const leftSize = mid - start + 1;
      const rightSize = end - mid;

      this.tree[leftChild]! += lazyValue * leftSize;
      this.tree[rightChild]! += lazyValue * rightSize;
      this.lazy[leftChild]! += lazyValue;
      this.lazy[rightChild]! += lazyValue;
      this.lazy[node] = 0;
    }
  }

  private rangeUpdateUtil(node: number, start: number, end: number, l: number, r: number, delta: number): void {
    if (r < start || end < l) {
      return;
    }
    if (l <= start && end <= r) {
      this.tree[node]! += delta * (end - start + 1);
      this.lazy[node]! += delta;
      return;
    }
    this.pushDown(node, start, end);
    const mid = Math.floor((start + end) / 2);
    this.rangeUpdateUtil(2 * node + 1, start, mid, l, r, delta);
    this.rangeUpdateUtil(2 * node + 2, mid + 1, end, l, r, delta);
    this.tree[node] = this.tree[2 * node + 1]! + this.tree[2 * node + 2]!;
  }

  private rangeQueryUtil(node: number, start: number, end: number, l: number, r: number): number {
    if (r < start || end < l) {
      return 0;
    }
    if (l <= start && end <= r) {
      return this.tree[node]!;
    }
    this.pushDown(node, start, end);
    const mid = Math.floor((start + end) / 2);
    const leftSum = this.rangeQueryUtil(2 * node + 1, start, mid, l, r);
    const rightSum = this.rangeQueryUtil(2 * node + 2, mid + 1, end, l, r);
    return leftSum + rightSum;
  }

  rangeQuery(from: number, to: number): number {
    return this.rangeQueryUtil(0, 0, this.n - 1, from, to);
  }

  rangeUpdate(from: number, to: number, delta: number): void {
    this.rangeUpdateUtil(0, 0, this.n - 1, from, to, delta);
  }

  pointUpdate(index: number, value: number): void {
    const current = this.get(index);
    this.rangeUpdate(index, index, value - current);
  }

  get(index: number): number {
    return this.rangeQuery(index, index);
  }

  size(): number {
    return this.n;
  }

  isEmpty(): boolean {
    return this.size() === 0
  }

  static from(items: any[]): LazySegmentTree3 {
    return new LazySegmentTree3(items)
  }

  toString(): string {
    return `LazySegmentTree3({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'LazySegmentTree3'
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
