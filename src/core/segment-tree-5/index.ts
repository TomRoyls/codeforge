export class SegmentTree5 {
  private tree: number[];
  private dataSize: number;
  private operation: (a: number, b: number) => number;

  constructor(data: number[], operation?: (a: number, b: number) => number) {
    this.dataSize = data.length;
    this.operation = operation || ((a, b) => a + b);
    this.tree = new Array(2 * this.dataSize);

    for (let i = 0; i < this.dataSize; i++) {
      this.tree[this.dataSize + i] = data[i]!;
    }

    for (let i = this.dataSize - 1; i > 0; i--) {
      this.tree[i] = this.operation(this.tree[2 * i]!, this.tree[2 * i + 1]!);
    }
  }

  update(index: number, value: number): void {
    index += this.dataSize;
    this.tree[index] = value;

    for (let i = Math.floor(index / 2); i >= 1; i = Math.floor(i / 2)) {
      this.tree[i] = this.operation(this.tree[2 * i]!, this.tree[2 * i + 1]!);
    }
  }

  query(from: number, to: number): number {
    from += this.dataSize;
    to += this.dataSize;
    let leftResult: number | null = null;
    let rightResult: number | null = null;

    while (from <= to) {
      if (from % 2 === 1) {
        leftResult = leftResult === null ? this.tree[from]! : this.operation(leftResult, this.tree[from]!);
        from++;
      }

      if (to % 2 === 0) {
        rightResult = rightResult === null ? this.tree[to]! : this.operation(this.tree[to]!, rightResult);
        to--;
      }

      from = Math.floor(from / 2);
      to = Math.floor(to / 2);
    }

    if (leftResult === null) return rightResult!;
    if (rightResult === null) return leftResult;
    return this.operation(leftResult, rightResult);
  }

  get(index: number): number {
    return this.tree[this.dataSize + index]!;
  }

  size(): number {
    return this.dataSize;
  }

  isEmpty(): boolean {
    return this.size() === 0
  }

  static from(items: any[]): SegmentTree5 {
    return new SegmentTree5(items)
  }

  toString(): string {
    return `SegmentTree5()`
  }

  get [Symbol.toStringTag](): string {
    return 'SegmentTree5'
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
