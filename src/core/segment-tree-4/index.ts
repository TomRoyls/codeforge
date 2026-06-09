export class SegmentTree {
  private n: number;
  private tree: { sum: number; min: number; max: number }[];
  private lazy: number[];

  constructor(array: number[]) {
    this.n = array.length;
    this.tree = Array(4 * this.n).fill({ sum: 0, min: 0, max: 0 });
    this.lazy = Array(4 * this.n).fill(0);
    this.build(array, 0, 0, this.n - 1);
  }

  private build(array: number[], node: number, start: number, end: number): void {
    if (start === end) {
      const val = array[start]!;
      this.tree[node]! = { sum: val, min: val, max: val };
      return;
    }

    const mid = Math.floor((start + end) / 2);
    const leftChild = 2 * node + 1;
    const rightChild = 2 * node + 2;

    this.build(array, leftChild, start, mid);
    this.build(array, rightChild, mid + 1, end);

    this.tree[node]! = {
      sum: this.tree[leftChild]!.sum + this.tree[rightChild]!.sum,
      min: Math.min(this.tree[leftChild]!.min, this.tree[rightChild]!.min),
      max: Math.max(this.tree[leftChild]!.max, this.tree[rightChild]!.max),
    };
  }

  private push(node: number, start: number, end: number): void {
    if (this.lazy[node]! === 0) return;

    const val = this.lazy[node]!;
    this.tree[node]!.sum += val * (end - start + 1);
    this.tree[node]!.min += val;
    this.tree[node]!.max += val;

    if (start !== end) {
      this.lazy[2 * node + 1]! += val;
      this.lazy[2 * node + 2]! += val;
    }

    this.lazy[node]! = 0;
  }

  private updateRange(node: number, start: number, end: number, l: number, r: number, val: number): void {
    this.push(node, start, end);

    if (start > r || end < l) return;

    if (start >= l && end <= r) {
      this.lazy[node]! += val;
      this.push(node, start, end);
      return;
    }

    const mid = Math.floor((start + end) / 2);
    const leftChild = 2 * node + 1;
    const rightChild = 2 * node + 2;

    this.updateRange(leftChild, start, mid, l, r, val);
    this.updateRange(rightChild, mid + 1, end, l, r, val);

    this.tree[node]! = {
      sum: this.tree[leftChild]!.sum + this.tree[rightChild]!.sum,
      min: Math.min(this.tree[leftChild]!.min, this.tree[rightChild]!.min),
      max: Math.max(this.tree[leftChild]!.max, this.tree[rightChild]!.max),
    };
  }

  private query(node: number, start: number, end: number, l: number, r: number): { sum: number; min: number; max: number } {
    this.push(node, start, end);

    if (start > r || end < l) {
      return { sum: 0, min: Infinity, max: -Infinity };
    }

    if (start >= l && end <= r) {
      return this.tree[node]!;
    }

    const mid = Math.floor((start + end) / 2);
    const leftChild = 2 * node + 1;
    const rightChild = 2 * node + 2;

    const leftResult = this.query(leftChild, start, mid, l, r);
    const rightResult = this.query(rightChild, mid + 1, end, l, r);

    return {
      sum: leftResult.sum + rightResult.sum,
      min: Math.min(leftResult.min, rightResult.min),
      max: Math.max(leftResult.max, rightResult.max),
    };
  }

  rangeSum(start: number, end: number): number {
    const result = this.query(0, 0, this.n - 1, start, end);
    return result.sum;
  }

  rangeMin(start: number, end: number): number {
    const result = this.query(0, 0, this.n - 1, start, end);
    return result.min;
  }

  rangeMax(start: number, end: number): number {
    const result = this.query(0, 0, this.n - 1, start, end);
    return result.max;
  }

  update(index: number, value: number): void {
    const currentResult = this.query(0, 0, this.n - 1, index, index);
    const currentValue = currentResult.sum;
    const diff = value - currentValue;
    this.updateRange(0, 0, this.n - 1, index, index, diff);
  }

  rangeAdd(start: number, end: number, value: number): void {
    this.updateRange(0, 0, this.n - 1, start, end, value);
  }

  getSize(): number {
    return this.n;
  }

  toArray(): number[] {
    const result: number[] = [];
    for (let i = 0; i < this.n; i++) {
      result.push(this.rangeSum(i, i));
    }
    return result;
  }

  getTimeComplexity(): string {
    return 'O(log n)';
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

  static from(items: any[]): SegmentTree {
    return new SegmentTree(items)
  }
}
