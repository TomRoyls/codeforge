export class WindowHeap2 {
  private windowSize: number;
  private values: number[];

  constructor(windowSize: number) {
    this.windowSize = windowSize;
    this.values = [];
  }

  push(value: number): void {
    this.values.push(value);
    if (this.values.length > this.windowSize) {
      this.values.shift();
    }
  }

  pushAndGetMedian(value: number): number {
    this.push(value);
    return this.getMedian();
  }

  getMedian(): number {
    if (this.values.length === 0) {
      throw new Error('Window is empty');
    }

    const sorted = [...this.values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1]! + sorted[mid]!) / 2;
    } else {
      return sorted[mid]!;
    }
  }

  getMin(): number {
    if (this.values.length === 0) {
      throw new Error('Window is empty');
    }
    let min = this.values[0]!;
    for (let i = 1; i < this.values.length; i++) {
      if (this.values[i]! < min) min = this.values[i]!;
    }
    return min;
  }

  getMax(): number {
    if (this.values.length === 0) {
      throw new Error('Window is empty');
    }
    let max = this.values[0]!;
    for (let i = 1; i < this.values.length; i++) {
      if (this.values[i]! > max) max = this.values[i]!;
    }
    return max;
  }

  getSum(): number {
    return this.values.reduce((sum, val) => sum + val, 0);
  }

  getAverage(): number {
    if (this.values.length === 0) {
      throw new Error('Window is empty');
    }
    return this.getSum() / this.values.length;
  }

  get size(): number {
    return this.values.length;
  }

  isEmpty(): boolean {
    return this.values.length === 0;
  }

  getWindow(): number[] {
    return [...this.values];
  }

  clear(): void {
    this.values = [];
  }
}
