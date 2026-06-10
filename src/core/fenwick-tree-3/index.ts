export class FenwickTree3 {
  private tree: number[] = [];
  private _size: number = 0;

  constructor(size: number) {
    if (size <= 0) {
      this._size = 0;
      return;
    }
    this._size = size;
    this.tree = new Array<number>(size + 1).fill(0);
  }

  update(index: number, delta: number): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size - 1}]`);
    }
    let i = index + 1;
    while (i <= this._size) {
      this.tree[i] = (this.tree[i] ?? 0) + delta;
      i += this.lsb(i);
    }
  }

  query(index: number): number {
    if (this._size === 0) {
      return 0;
    }
    if (index < 0) {
      return 0;
    }
    const clampedIndex = Math.min(index, this._size - 1);
    let sum = 0;
    let i = clampedIndex + 1;
    while (i > 0) {
      sum += this.tree[i] ?? 0;
      i -= this.lsb(i);
    }
    return sum;
  }

  rangeQuery(from: number, to: number): number {
    if (from > to) {
      return 0;
    }
    if (from <= 0) {
      return this.query(to);
    }
    return this.query(to) - this.query(from - 1);
  }

  get(index: number): number {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size - 1}]`);
    }
    return this.query(index) - this.query(index - 1);
  }

  set(index: number, value: number): void {
    const current = this.get(index);
    const delta = value - current;
    this.update(index, delta);
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  private lsb(i: number): number {
    return i & -i;
  }

  toString(): string {
    return `${FenwickTree3}({ size: ${this.size} })`
  }

  clear(): void {
    this._size = 0
  }

  get [Symbol.toStringTag](): string {
    return 'FenwickTree3'
  }
}
