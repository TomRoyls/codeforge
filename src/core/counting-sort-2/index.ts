export class CountingSort {
  private array: number[];
  private maxValue: number | undefined;
  private counts: Map<number, number>;

  constructor(array: number[], maxValue?: number) {
    this.array = array;
    this.maxValue = maxValue;
    this.counts = this.buildCounts();
  }

  private buildCounts(): Map<number, number> {
    const map = new Map<number, number>();
    for (let i = 0; i < this.array.length; i++) {
      const value = this.array[i]!;
      const current = map.get(value) ?? 0;
      map.set(value, current + 1);
    }
    return map;
  }

  sort(): number[] {
    if (this.array.length === 0) {
      return [];
    }

    const max = this.maxValue !== undefined ? this.maxValue : this.getMax()!;
    const min = this.getMin()!;
    const range = max - min + 1;

    const countArray = new Array<number>(range).fill(0);

    for (let i = 0; i < this.array.length; i++) {
      const value = this.array[i]!;
      countArray[value - min]!++;
    }

    const result: number[] = [];
    let resultIndex = 0;

    for (let i = 0; i < countArray.length; i++) {
      const count = countArray[i]!;
      const value = i + min;
      for (let j = 0; j < count; j++) {
        result[resultIndex++] = value;
      }
    }

    return result;
  }

  isSorted(): boolean {
    for (let i = 0; i < this.array.length - 1; i++) {
      if (this.array[i]! > this.array[i + 1]!) {
        return false;
      }
    }
    return true;
  }

  getCounts(): Map<number, number> {
    return new Map(this.counts);
  }

  getMin(): number | undefined {
    if (this.array.length === 0) {
      return undefined;
    }
    let min = this.array[0]!;
    for (let i = 1; i < this.array.length; i++) {
      if (this.array[i]! < min) {
        min = this.array[i]!;
      }
    }
    return min;
  }

  getMax(): number | undefined {
    if (this.array.length === 0) {
      return undefined;
    }
    let max = this.array[0]!;
    for (let i = 1; i < this.array.length; i++) {
      if (this.array[i]! > max) {
        max = this.array[i]!;
      }
    }
    return max;
  }

  toArray(): number[] {
    return this.array.slice();
  }

  getTimeComplexity(): string {
    const n = this.array.length;
    const k = this.maxValue !== undefined ? this.maxValue - (this.getMin() ?? 0) + 1 : this.getCounts().size;
    return `O(n + k) where n=${n} (input size), k=${k} (range of values)`;
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

  toString(): string {
    return `CountingSort()`
  }
}
