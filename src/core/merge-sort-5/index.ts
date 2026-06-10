export class MergeSort5 {
  private compare: (a: number, b: number) => number;

  constructor(compare?: (a: number, b: number) => number) {
    this.compare = compare ?? ((a: number, b: number) => a - b);
  }

  sort(arr: number[]): number[] {
    if (arr.length <= 1) return arr.slice();
    const result = arr.slice();
    this.sortInPlace(result);
    return result;
  }

  sortInPlace(arr: number[]): void {
    const n = arr.length;
    if (n <= 1) return;
    for (let size = 1; size < n; size *= 2) {
      for (let start = 0; start < n - size; start += 2 * size) {
        const mid = start + size;
        const end = Math.min(start + 2 * size, n);
        this.mergeInPlace(arr, start, mid, end);
      }
    }
  }

  sortRange(arr: number[], start: number, end: number): number[] {
    if (start >= end) return [];
    const result = arr.slice(start, end);
    this.sortInPlace(result);
    return result;
  }

  isSorted(arr: number[]): boolean {
    for (let i = 0; i < arr.length - 1; i++) {
      if (this.compare(arr[i]!, arr[i + 1]!) > 0) return false;
    }
    return true;
  }

  merge(left: number[], right: number[]): number[] {
    const result: number[] = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
      if (this.compare(left[i] as number, right[j] as number) <= 0) {
        result.push(left[i]!);
        i++;
      } else {
        result.push(right[j]!);
        j++;
      }
    }
    while (i < left.length) {
      result.push(left[i]!);
      i++;
    }
    while (j < right.length) {
      result.push(right[j]!);
      j++;
    }
    return result;
  }

  private mergeInPlace(arr: number[], start: number, mid: number, end: number): void {
    const left = arr.slice(start, mid);
    const right = arr.slice(mid, end);
    let i = 0;
    let j = 0;
    let k = start;
    while (i < left.length && j < right.length) {
      if (this.compare(left[i] as number, right[j] as number) <= 0) {
        arr[k] = left[i]!;
        i++;
      } else {
        arr[k] = right[j]!;
        j++;
      }
      k++;
    }
    while (i < left.length) {
      arr[k] = left[i]!;
      i++;
      k++;
    }
    while (j < right.length) {
      arr[k] = right[j]!;
      j++;
      k++;
    }
  }

  toString(): string {
    return `MergeSort5()`
  }

  get [Symbol.toStringTag](): string {
    return 'MergeSort5'
  }
}
