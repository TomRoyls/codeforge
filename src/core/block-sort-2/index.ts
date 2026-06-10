import type { CompareFn } from './types.js';

export class BlockSort2 {
  private compareFn: CompareFn<number>;

  constructor(compare?: CompareFn<number>) {
    this.compareFn = compare || ((a: number, b: number) => a - b);
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
    const blockSize = Math.max(32, Math.floor(Math.sqrt(arr.length)));
    this.blockSort(arr, 0, arr.length - 1, blockSize);
  }

  private blockSort(arr: number[], left: number, right: number, blockSize: number): void {
    if (left >= right) {
      return;
    }
    if (right - left + 1 <= blockSize) {
      this.insertionSort(arr, left, right);
      return;
    }

    const mid = left + Math.floor((right - left) / 2);
    this.blockSort(arr, left, mid, blockSize);
    this.blockSort(arr, mid + 1, right, blockSize);
    this.blockMerge(arr, left, mid, right, blockSize);
  }

  private insertionSort(arr: number[], left: number, right: number): void {
    for (let i = left + 1; i <= right; i++) {
      const key = arr[i]!;
      let j = i - 1;
      while (j >= left && this.compareFn(arr[j]!, key) > 0) {
        arr[j + 1] = arr[j]!;
        j--;
      }
      arr[j + 1] = key;
    }
  }

  private blockMerge(arr: number[], left: number, mid: number, right: number, blockSize: number): void {
    const leftBlocks: number[][] = [];
    const rightBlocks: number[][] = [];

    for (let i = left; i <= mid; i += blockSize) {
      const blockEnd = Math.min(i + blockSize - 1, mid);
      leftBlocks.push(arr.slice(i, blockEnd + 1));
    }

    for (let i = mid + 1; i <= right; i += blockSize) {
      const blockEnd = Math.min(i + blockSize - 1, right);
      rightBlocks.push(arr.slice(i, blockEnd + 1));
    }

    let leftBlockIdx = 0;
    let rightBlockIdx = 0;
    let leftPos = 0;
    let rightPos = 0;
    let writePos = left;

    while (leftBlockIdx < leftBlocks.length && rightBlockIdx < rightBlocks.length) {
      const leftBlock = leftBlocks[leftBlockIdx]!;
      const rightBlock = rightBlocks[rightBlockIdx]!;

      while (leftPos < leftBlock.length && rightPos < rightBlock.length) {
        if (this.compareFn(leftBlock[leftPos]!, rightBlock[rightPos]!) <= 0) {
          arr[writePos] = leftBlock[leftPos]!;
          leftPos++;
        } else {
          arr[writePos] = rightBlock[rightPos]!;
          rightPos++;
        }
        writePos++;
      }

      if (leftPos >= leftBlock.length) {
        leftBlockIdx++;
        leftPos = 0;
      } else {
        rightBlockIdx++;
        rightPos = 0;
      }
    }

    while (leftBlockIdx < leftBlocks.length) {
      const leftBlock = leftBlocks[leftBlockIdx]!;
      for (let i = leftPos; i < leftBlock.length; i++) {
        arr[writePos] = leftBlock[i]!;
        writePos++;
      }
      leftBlockIdx++;
      leftPos = 0;
    }

    while (rightBlockIdx < rightBlocks.length) {
      const rightBlock = rightBlocks[rightBlockIdx]!;
      for (let i = rightPos; i < rightBlock.length; i++) {
        arr[writePos] = rightBlock[i]!;
        writePos++;
      }
      rightBlockIdx++;
      rightPos = 0;
    }
  }

  isSorted(arr: number[]): boolean {
    for (let i = 0; i < arr.length - 1; i++) {
      if (this.compareFn(arr[i]!, arr[i + 1]!) > 0) {
        return false;
      }
    }
    return true;
  }

  toString(): string {
    return `BlockSort2()`
  }

  static empty(): BlockSort2 {
    return new BlockSort2()
  }

  get [Symbol.toStringTag](): string {
    return 'BlockSort2'
  }
}
