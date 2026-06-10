export class WindowHeap2 {
  private windowSize: number;
  private values: number[];
  private _head = 0;

  constructor(windowSize: number) {
    this.windowSize = windowSize;
    this.values = [];
  }

  private _size(): number {
    return this.values.length - this._head;
  }

  private _compact(): void {
    if (this._head > 0) {
      this.values = this.values.slice(this._head);
      this._head = 0;
    }
  }

  private _getValues(): number[] {
    return this.values.slice(this._head);
  }

  push(value: number): void {
    this.values.push(value);
    if (this._size() > this.windowSize) {
      this._head++;
      if (this._head > this.values.length / 2) {
        this._compact();
      }
    }
  }

  pushAndGetMedian(value: number): number {
    this.push(value);
    return this.getMedian();
  }

  getMedian(): number {
    if (this._size() === 0) {
      throw new Error('Window is empty');
    }

    const sorted = [...this._getValues()].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1]! + sorted[mid]!) / 2;
    } else {
      return sorted[mid]!;
    }
  }

  getMin(): number {
    if (this._size() === 0) {
      throw new Error('Window is empty');
    }
    let min = this.values[this._head]!;
    for (let i = this._head + 1; i < this.values.length; i++) {
      if (this.values[i]! < min) min = this.values[i]!;
    }
    return min;
  }

  getMax(): number {
    if (this._size() === 0) {
      throw new Error('Window is empty');
    }
    let max = this.values[this._head]!;
    for (let i = this._head + 1; i < this.values.length; i++) {
      if (this.values[i]! > max) max = this.values[i]!;
    }
    return max;
  }

  getSum(): number {
    let sum = 0;
    for (let i = this._head; i < this.values.length; i++) {
      sum += this.values[i]!;
    }
    return sum;
  }

  getAverage(): number {
    if (this._size() === 0) {
      throw new Error('Window is empty');
    }
    return this.getSum() / this._size();
  }

  get size(): number {
    return this._size();
  }

  isEmpty(): boolean {
    return this._size() === 0;
  }

  getWindow(): number[] {
    return this._getValues();
  }

  clear(): void {
    this.values = [];
    this._head = 0;
  }

  toString(): string {
    return `WindowHeap2({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'WindowHeap2'
  }
}
