export class SleepSort2 {
  private array: number[];
  private buckets: Map<number, number[]>;
  private minValue: number | undefined;
  private maxValue: number | undefined;

  constructor(array: number[]) {
    this.array = [...array];
    this.buckets = new Map<number, number[]>();

    if (array.length === 0) {
      this.minValue = undefined;
      this.maxValue = undefined;
      return;
    }

    this.minValue = Math.min(...this.array);
    this.maxValue = Math.max(...this.array);

    for (let i = 0; i < this.array.length; i++) {
      const value = this.array[i]!;
      const bucket = this.buckets.get(value) ?? [];
      bucket.push(value);
      this.buckets.set(value, bucket);
    }
  }

  sort(arr: number[]): number[] {
    if (arr.length === 0) {
      return [];
    }

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const buckets = new Map<number, number[]>();

    for (let i = 0; i < arr.length; i++) {
      const value = arr[i]!;
      const bucket = buckets.get(value) ?? [];
      bucket.push(value);
      buckets.set(value, bucket);
    }

    const output: number[] = [];
    for (let i = min; i <= max; i++) {
      const bucket = buckets.get(i);
      if (bucket) {
        for (let j = 0; j < bucket.length; j++) {
          output.push(bucket[j]!);
        }
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
    const buckets = new Map<number, number[]>();

    for (let i = 0; i < arr.length; i++) {
      const value = arr[i]!;
      const bucket = buckets.get(value) ?? [];
      bucket.push(value);
      buckets.set(value, bucket);
    }

    const output: number[] = [];
    for (let i = max; i >= min; i--) {
      const bucket = buckets.get(i);
      if (bucket) {
        for (let j = 0; j < bucket.length; j++) {
          output.push(bucket[j]!);
        }
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

  static getSleepTime(value: number): number {
    return Math.max(0, value);
  }

  static simulateSleepSort(arr: number[]): number[] {
    if (arr.length === 0) {
      return [];
    }

    const sleepEvents: Array<{ time: number; value: number }> = [];
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i]!;
      const sleepTime = SleepSort2.getSleepTime(value);
      sleepEvents.push({ time: sleepTime, value });
    }

    sleepEvents.sort((a, b) => {
      if (a.time !== b.time) {
        return a.time - b.time;
      }
      return a.value - b.value;
    });
    return sleepEvents.map((event) => event.value);
  }

  static sortBySleepSchedule(arr: number[]): number[] {
    if (arr.length === 0) {
      return [];
    }

    const sorted = [...arr];
    sorted.sort((a, b) => {
      const sleepA = SleepSort2.getSleepTime(a);
      const sleepB = SleepSort2.getSleepTime(b);
      if (sleepA !== sleepB) {
        return sleepA - sleepB;
      }
      return a - b;
    });

    return sorted;
  }

  static getWakeUpOrder(arr: number[]): number[] {
    if (arr.length === 0) {
      return [];
    }

    const wakeTimes = arr.map((value) => ({
      value,
      wakeTime: SleepSort2.getSleepTime(value),
    }));

    wakeTimes.sort((a, b) => {
      if (a.wakeTime !== b.wakeTime) {
        return a.wakeTime - b.wakeTime;
      }
      return a.value - b.value;
    });
    return wakeTimes.map((item) => item.value);
  }

  static getBucketCount(arr: number[]): number {
    const unique = new Set(arr);
    return unique.size;
  }

  static getSleepDurations(arr: number[]): number[] {
    return arr.map((value) => SleepSort2.getSleepTime(value));
  }

  static getMaxSleepTime(arr: number[]): number {
    if (arr.length === 0) {
      return 0;
    }
    return Math.max(...arr.map((value) => SleepSort2.getSleepTime(value)));
  }

  static getMinSleepTime(arr: number[]): number {
    if (arr.length === 0) {
      return 0;
    }
    return Math.min(...arr.map((value) => SleepSort2.getSleepTime(value)));
  }

  static getTotalSleepTime(arr: number[]): number {
    return arr.reduce((sum, value) => sum + SleepSort2.getSleepTime(value), 0);
  }

  static getAverageSleepTime(arr: number[]): number {
    if (arr.length === 0) {
      return 0;
    }
    return SleepSort2.getTotalSleepTime(arr) / arr.length;
  }

  getBuckets(): Map<number, number[]> {
    return new Map(this.buckets);
  }

  getMin(): number | undefined {
    return this.minValue;
  }

  getMax(): number | undefined {
    return this.maxValue;
  }

  getRange(): number {
    if (this.minValue === undefined || this.maxValue === undefined) {
      return 0;
    }
    return this.maxValue - this.minValue + 1;
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
    const n = this.array.length;
    return `O(n) = O(${n})`;
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

  toString(): string {
    return `SleepSort2()`
  }

  toJSON() {
    return { type: 'SleepSort2', items: this.toArray() }
  }
}
