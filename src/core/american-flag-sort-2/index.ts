import type { CompareFn } from '../types.js';

export class AmericanFlagSort2 {
  private comparator: CompareFn<number>;
  private useDefaultComparator: boolean;

  constructor(comparator?: CompareFn<number>) {
    if (comparator) {
      this.comparator = comparator;
      this.useDefaultComparator = false;
    } else {
      this.comparator = ((a: number, b: number) => a - b);
      this.useDefaultComparator = true;
    }
  }

  sort(arr: number[]): number[] {
    if (arr.length <= 1) {
      return arr.slice();
    }
    const copy = arr.slice();
    this.sortInPlace(copy);
    return copy;
  }

  sortInPlace(arr: number[]): void {
    if (arr.length <= 1) {
      return;
    }

    if (!this.useDefaultComparator) {
      this.insertionSort(arr, 0, arr.length - 1);
      return;
    }

    const hasFloats = arr.some(n => !Number.isInteger(n));
    if (hasFloats) {
      this.insertionSort(arr, 0, arr.length - 1);
      return;
    }

    const offset = this.findOffset(arr);
    if (offset !== 0) {
      for (let i = 0; i < arr.length; i++) {
        arr[i]! = arr[i]! + offset;
      }
    }

    const max = Math.max(...arr);
    this.americanFlagSort(arr, 0, arr.length - 1, 0, max);

    if (offset !== 0) {
      for (let i = 0; i < arr.length; i++) {
        arr[i]! = arr[i]! - offset;
      }
    }
  }

  private findOffset(arr: number[]): number {
    const min = Math.min(...arr);
    return min < 0 ? -min : 0;
  }

  private americanFlagSort(arr: number[], low: number, high: number, digit: number, max: number): void {
    if (low >= high) {
      return;
    }

    const maxDigits = this.digits(max);
    if (digit >= maxDigits) {
      return;
    }

    const counts = new Array(256).fill(0);
    const size = high - low + 1;

    for (let i = low; i <= high; i++) {
      const d = this.getByte(arr[i]!, digit);
      counts[d]!++;
    }

    const positions = new Array(257).fill(0);
    for (let i = 0; i < 256; i++) {
      positions[i + 1] = positions[i]! + counts[i]!;
    }

    const temp = new Array(size);
    for (let i = low; i <= high; i++) {
      const d = this.getByte(arr[i]!, digit);
      const pos = positions[d]!;
      temp[pos] = arr[i]!;
      positions[d] = pos + 1;
    }

    for (let i = 0; i < size; i++) {
      arr[low + i]! = temp[i]!;
    }

    if (digit >= maxDigits - 1) {
      return;
    }

    let start = low;
    for (let i = 0; i < 256; i++) {
      const count = counts[i]!;
      if (count > 1) {
        this.americanFlagSort(arr, start, start + count - 1, digit + 1, max);
      }
      start += count;
    }
  }

  private getByte(num: number, digit: number): number {
    return (num >> (8 * digit)) & 0xFF;
  }

  private digits(num: number): number {
    if (num === 0) {
      return 1;
    }
    let d = 0;
    let n = Math.abs(num);
    while (n > 0) {
      n = n >> 8;
      d++;
    }
    return d;
  }

  private insertionSort(arr: number[], low: number, high: number): void {
    for (let i = low + 1; i <= high; i++) {
      const key = arr[i]!;
      let j = i - 1;
      while (j >= low && this.comparator(arr[j]!, key) > 0) {
        arr[j + 1]! = arr[j]!;
        j--;
      }
      arr[j + 1]! = key;
    }
  }

  isSorted(arr: number[]): boolean {
    for (let i = 0; i < arr.length - 1; i++) {
      if (this.comparator(arr[i]!, arr[i + 1]!) > 0) {
        return false;
      }
    }
    return true;
  }
}
