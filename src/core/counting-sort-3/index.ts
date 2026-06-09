export class CountingSort {
  private array: number[];
  private counts: number[];
  private minValue: number | undefined;
  private maxValue: number;

  constructor(array: number[], maxValue?: number) {
    this.array = [...array];
    if (array.length === 0) {
      this.minValue = undefined;
      this.maxValue = 0;
      this.counts = [];
      return;
    }

    this.minValue = Math.min(...this.array);
    this.maxValue = maxValue !== undefined ? maxValue : Math.max(...this.array);

    const range = this.maxValue - this.minValue + 1;
    this.counts = new Array(range).fill(0);

    for (let i = 0; i < this.array.length; i++) {
      const value = this.array[i]!;
      const index = value - this.minValue!;
      this.counts[index]! = (this.counts[index]! ?? 0) + 1;
    }
  }

  sort(): number[] {
    if (this.array.length === 0) {
      return [];
    }

    const cumulative = [...this.counts];
    for (let i = 1; i < cumulative.length; i++) {
      cumulative[i]! = cumulative[i]! + cumulative[i - 1]!;
    }

    const output = new Array(this.array.length).fill(0);
    for (let i = this.array.length - 1; i >= 0; i--) {
      const value = this.array[i]!;
      const index = value - this.minValue!;
      cumulative[index]!--;
      output[cumulative[index]!] = value;
    }

    return output;
  }

  isSorted(): boolean {
    if (this.array.length <= 1) {
      return true;
    }

    for (let i = 1; i < this.array.length; i++) {
      if (this.array[i]! < this.array[i - 1]!) {
        return false;
      }
    }

    return true;
  }

  getCounts(): number[] {
    return [...this.counts];
  }

  getMin(): number | undefined {
    return this.minValue;
  }

  getMax(): number | undefined {
    if (this.array.length === 0) {
      return undefined;
    }
    return this.maxValue;
  }

  getRange(): number {
    return this.maxValue - (this.minValue ?? 0) + 1;
  }

  toArray(): number[] {
    return [...this.array];
  }

  getTimeComplexity(): string {
    const n = this.array.length;
    const k = this.getRange();
    return `O(n + k) = O(${n} + ${k})`;
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

  forEach(callback: (item: unknown, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }
}
