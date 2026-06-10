export type { GrailSortOptions } from "./types.js"

const INSERTION_SORT_THRESHOLD = 32;

export class GrailSort {
  static sort<T>(arr: T[], comparator?: (a: T, b: T) => number): T[] {
    const compare = comparator || defaultComparator;
    const length = arr.length;

    if (length < 2) {
      return arr;
    }

    if (length < INSERTION_SORT_THRESHOLD) {
      insertionSort(arr, 0, length, compare);
    } else {
      mergeSort(arr, 0, length, compare);
    }

    return arr;
  }

  toString(): string {
    return `GrailSort()`
  }

  get [Symbol.toStringTag](): string {
    return 'GrailSort'
  }
}

export function isSorted<T>(arr: T[], comparator?: (a: T, b: T) => number): boolean {
  const compare = comparator || defaultComparator;

  for (let i = 1; i < arr.length; i++) {
    if (compare(arr[i - 1]!, arr[i]!) > 0) {
      return false;
    }
  }

  return true;
}

function defaultComparator<T>(a: T, b: T): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function insertionSort<T>(arr: T[], left: number, right: number, compare: (a: T, b: T) => number): void {
  for (let i = left + 1; i < right; i++) {
    const key = arr[i]!
    let j = i - 1

    while (j >= left && compare(arr[j]!, key) > 0) {
      arr[j + 1] = arr[j]!
      j--;
    }

    arr[j + 1] = key;
  }
}

function mergeSort<T>(arr: T[], left: number, right: number, compare: (a: T, b: T) => number): void {
  if (right - left < INSERTION_SORT_THRESHOLD) {
    insertionSort(arr, left, right, compare);
    return;
  }

  const mid = Math.floor((left + right) / 2);
  mergeSort(arr, left, mid, compare);
  mergeSort(arr, mid, right, compare);
  merge(arr, left, mid, right, compare);
}

function merge<T>(arr: T[], left: number, mid: number, right: number, compare: (a: T, b: T) => number): void {
  const leftArr = arr.slice(left, mid);
  const rightArr = arr.slice(mid, right);

  let i = 0;
  let j = 0;
  let k = left;

  while (i < leftArr.length && j < rightArr.length) {
    if (compare(leftArr[i]!, rightArr[j]!) <= 0) {
      arr[k] = leftArr[i]!
      i++
    } else {
      arr[k] = rightArr[j]!
      j++
    }
    k++
  }

  while (i < leftArr.length) {
    arr[k] = leftArr[i]!
    i++
    k++
  }

  while (j < rightArr.length) {
    arr[k] = rightArr[j]!
    j++
    k++
  }
}
