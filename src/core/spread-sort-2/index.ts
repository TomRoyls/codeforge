import type { CompareFn } from '../types.js';

export class SpreadSort2 {
  private comparisons: number = 0;
  private swaps: number = 0;
  private compareFn: CompareFn<number>;

  constructor(compare?: CompareFn<number>) {
    this.compareFn = compare || ((a: number, b: number) => a - b);
  }

  private compare(a: number, b: number): number {
    this.comparisons++;
    return this.compareFn(a, b);
  }

  sort(arr: number[]): number[] {
    const copy = arr.slice();
    this.sortInPlace(copy);
    return copy;
  }

  sortInPlace(arr: number[]): void {
    if (arr.length <= 1) {
      return;
    }
    this.spreadSortInPlace(arr);
  }

  private spreadSortInPlace(arr: number[]): void {
    if (arr.length <= 1) {
      return;
    }

    const min = this.findMin(arr);
    const max = this.findMax(arr);
    const range = max - min;

    if (range === 0) {
      return;
    }

    const bucketCount = Math.min(arr.length, Math.ceil(Math.sqrt(arr.length)));
    const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

    for (let i = 0; i < arr.length; i++) {
      const value = arr[i]!;
      const bucketIndex = Math.floor(((value - min) / range) * (bucketCount - 1));
      const safeIndex = Math.min(bucketIndex, bucketCount - 1);
      buckets[safeIndex]!.push(value);
    }

    let index = 0;
    for (let i = 0; i < bucketCount; i++) {
      const bucket = buckets[i]!;
      if (bucket.length === 0) {
        continue;
      }
      if (bucket.length === 1) {
        arr[index] = bucket[0]!;
        index++;
      } else if (bucket.length === 2) {
        if (this.compare(bucket[0]!, bucket[1]!) > 0) {
          arr[index] = bucket[1]!;
          arr[index + 1] = bucket[0]!;
          this.swaps++;
        } else {
          arr[index] = bucket[0]!;
          arr[index + 1] = bucket[1]!;
        }
        index += 2;
      } else {
        this.insertionSortInPlace(bucket);
        for (let j = 0; j < bucket.length; j++) {
          arr[index] = bucket[j]!;
          index++;
        }
      }
    }
  }

  private findMin(arr: number[]): number {
    let min = arr[0]!;
    for (let i = 1; i < arr.length; i++) {
      if (this.compare(arr[i]!, min) < 0) {
        min = arr[i]!;
      }
    }
    return min;
  }

  private findMax(arr: number[]): number {
    let max = arr[0]!;
    for (let i = 1; i < arr.length; i++) {
      if (this.compare(arr[i]!, max) > 0) {
        max = arr[i]!;
      }
    }
    return max;
  }

  private insertionSortInPlace(arr: number[]): void {
    for (let i = 1; i < arr.length; i++) {
      let j = i;
      while (j > 0 && this.compare(arr[j - 1]!, arr[j]!) > 0) {
        const temp = arr[j]!;
        arr[j] = arr[j - 1]!;
        arr[j - 1] = temp;
        this.swaps++;
        j--;
      }
    }
  }

  isSorted(arr: number[]): boolean {
    for (let i = 0; i < arr.length - 1; i++) {
      if (this.compare(arr[i]!, arr[i + 1]!) > 0) {
        return false;
      }
    }
    return true;
  }

  getComparisons(): number {
    return this.comparisons;
  }

  getSwaps(): number {
    return this.swaps;
  }

  resetCounters(): void {
    this.comparisons = 0;
    this.swaps = 0;
  }

  toString(): string {
    return `SpreadSort2()`
  }
}
