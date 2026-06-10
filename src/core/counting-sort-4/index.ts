export class CountingSort4 {
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

  sort(arr: number[]): number[] {
    if (arr.length === 0) {
      return [];
    }

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min + 1;
    const counts = new Array(range).fill(0);

    for (let i = 0; i < arr.length; i++) {
      const index = arr[i]! - min;
      counts[index]!++;
    }

    const output: number[] = [];
    for (let i = 0; i < range; i++) {
      const count = counts[i]!;
      for (let j = 0; j < count; j++) {
        output.push(i + min);
      }
    }

    return output;
  }

  sortDescending(arr: number[]): number[] {
    if (arr.length === 0) {
      return [];
    }

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min + 1;
    const counts = new Array(range).fill(0);

    for (let i = 0; i < arr.length; i++) {
      const index = arr[i]! - min;
      counts[index]!++;
    }

    const output: number[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const count = counts[i]!;
      for (let j = 0; j < count; j++) {
        output.push(i + min);
      }
    }

    return output;
  }

  isSorted(arr: number[]): boolean {
    if (arr.length <= 1) {
      return true;
    }

    for (let i = 1; i < arr.length; i++) {
      if (arr[i]! < arr[i - 1]!) {
        return false;
      }
    }

    return true;
  }

  static sortByKey<T>(arr: T[], keyFn: (item: T) => number): T[] {
    if (arr.length === 0) {
      return [];
    }

    const keys = arr.map(keyFn);
    const min = Math.min(...keys);
    const max = Math.max(...keys);
    const range = max - min + 1;

    const counts = new Array(range).fill(0);
    for (let i = 0; i < keys.length; i++) {
      const index = keys[i]! - min;
      counts[index]!++;
    }

    const cumulative = [...counts];
    for (let i = 1; i < cumulative.length; i++) {
      cumulative[i]! += cumulative[i - 1]!;
    }

    const output = new Array(arr.length).fill(undefined);
    for (let i = arr.length - 1; i >= 0; i--) {
      const key = keys[i]!;
      const index = key - min;
      cumulative[index]!--;
      output[cumulative[index]!] = arr[i];
    }

    return output as T[];
  }

  static countFrequency(arr: number[], value: number): number {
    let count = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]! === value) {
        count++;
      }
    }
    return count;
  }

  static getMin(arr: number[]): number | undefined {
    if (arr.length === 0) {
      return undefined;
    }
    return Math.min(...arr);
  }

  static getMax(arr: number[]): number | undefined {
    if (arr.length === 0) {
      return undefined;
    }
    return Math.max(...arr);
  }

  static stableCountSort(arr: number[]): number[] {
    if (arr.length === 0) {
      return [];
    }

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min + 1;

    const counts = new Array(range).fill(0);
    for (let i = 0; i < arr.length; i++) {
      const index = arr[i]! - min;
      counts[index]!++;
    }

    const cumulative = [...counts];
    for (let i = 1; i < cumulative.length; i++) {
      cumulative[i]! += cumulative[i - 1]!;
    }

    const output = new Array(arr.length).fill(0);
    for (let i = arr.length - 1; i >= 0; i--) {
      const value = arr[i]!;
      const index = value - min;
      cumulative[index]!--;
      output[cumulative[index]!] = value;
    }

    return output;
  }

  static countDistinct(arr: number[]): number {
    if (arr.length === 0) {
      return 0;
    }

    const unique = new Set(arr);
    return unique.size;
  }

  static histogram(arr: number[]): Map<number, number> {
    const map = new Map<number, number>();

    for (let i = 0; i < arr.length; i++) {
      const value = arr[i]!;
      const current = map.get(value) ?? 0;
      map.set(value, current + 1);
    }

    return map;
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

  getSpaceComplexity(): string {
    const k = this.getRange();
    return `O(k) = O(${k})`;
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

  clear(): void {
    this.array = []
    this.minValue = undefined
    this.maxValue = 0
    this.counts = []
  }

  toString(): string {
    return `CountingSort4()`
  }

  toJSON() {
    return { type: 'CountingSort4', items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'CountingSort4'
  }
}
