export class MergeSort2 {
  private comparisons: number = 0;
  private swaps: number = 0;
  private compareFn: (a: number, b: number) => number;

  constructor(compare?: (a: number, b: number) => number) {
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
    this.mergeSortInPlace(arr, 0, arr.length - 1);
  }

  private mergeSortInPlace(arr: number[], left: number, right: number): void {
    if (left >= right) {
      return;
    }
    const mid = Math.floor((left + right) / 2);
    this.mergeSortInPlace(arr, left, mid);
    this.mergeSortInPlace(arr, mid + 1, right);
    this.mergeInPlace(arr, left, mid, right);
  }

  private mergeInPlace(arr: number[], left: number, mid: number, right: number): void {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftArr.length && j < rightArr.length) {
      if (this.compare(leftArr[i]!, rightArr[j]!) <= 0) {
        arr[k] = leftArr[i]!;
        i++;
      } else {
        arr[k] = rightArr[j]!;
        j++;
      }
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i]!;
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j]!;
      j++;
      k++;
    }
  }

  sortRange(arr: number[], left: number, right: number): number[] {
    const copy = arr.slice(left, right + 1);
    this.sortInPlace(copy);
    return copy;
  }

  isSorted(arr: number[]): boolean {
    for (let i = 0; i < arr.length - 1; i++) {
      if (this.compare(arr[i]!, arr[i + 1]!) > 0) {
        return false;
      }
    }
    return true;
  }

  merge(left: number[], right: number[]): number[] {
    const result: number[] = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      if (this.compare(left[i]!, right[j]!) <= 0) {
        result.push(left[i]!);
        i++;
      } else {
        result.push(right[j]!);
        j++;
        this.swaps++;
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
    return `MergeSort2()`
  }
}
