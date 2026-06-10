export class LazySegmentTree {
  private tree: number[];
  private lazy: number[];
  private n: number;

  constructor(array: number[]) {
    this.n = array.length;
    const size = 4 * this.n;
    this.tree = new Array(size).fill(0);
    this.lazy = new Array(size).fill(0);
    this.build(array, 0, 0, this.n - 1);
  }

  private build(array: number[], node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = array[start]!;
      return;
    }
    const mid = Math.floor((start + end) / 2);
    this.build(array, 2 * node + 1, start, mid);
    this.build(array, 2 * node + 2, mid + 1, end);
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

  private rangeUpdateUtil(node: number, start: number, end: number, l: number, r: number, value: number): void {
    if (r < start || end < l) {
      return;
    }
    if (l <= start && end <= r) {
      this.tree[node]! += value * (end - start + 1);
      this.lazy[node]! += value;
      return;
    }
    this.pushDown(node, start, end);
    const mid = Math.floor((start + end) / 2);
    this.rangeUpdateUtil(2 * node + 1, start, mid, l, r, value);
    this.rangeUpdateUtil(2 * node + 2, mid + 1, end, l, r, value);
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

  rangeQuery(start: number, end: number): number {
    return this.rangeQueryUtil(0, 0, this.n - 1, start, end);
  }

  rangeUpdate(start: number, end: number, value: number): void {
    this.rangeUpdateUtil(0, 0, this.n - 1, start, end, value);
  }

  pointQuery(index: number): number {
    return this.rangeQuery(index, index);
  }

  pointUpdate(index: number, value: number): void {
    const current = this.pointQuery(index);
    this.rangeUpdate(index, index, value - current);
  }

  getSize(): number {
    return this.n;
  }

  toArray(): number[] {
    const result: number[] = [];
    for (let i = 0; i < this.n; i++) {
      result.push(this.pointQuery(i));
    }
    return result;
  }

  getTimeComplexity(): string {
    return "Query: O(log n), Update: O(log n), Build: O(n)";
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  static from(items: any[]): LazySegmentTree {
    return new LazySegmentTree(items)
  }

  clone(): LazySegmentTree {
    return LazySegmentTree.from(this.toArray())
  }

  forEach(callback: (item: number, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toString(): string {
    return `LazySegmentTree()`
  }

  toJSON() {
    return { type: 'LazySegmentTree', items: this.toArray() }
  }

  isEmpty(): boolean {
    return this.n === 0
  }

  clear(): void {
    this.n = 0
    this.tree.length = 0
  }

  get size(): number {
    return this.n
  }
}
