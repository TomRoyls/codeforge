export class PancakeSort<T> {
  private arr: T[];
  private comparator: (a: T, b: T) => number;
  private flipCount: number;

  constructor(array: T[], comparator?: (a: T, b: T) => number) {
    this.arr = [...array];
    this.comparator = comparator ?? ((a: T, b: T): number => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this.flipCount = 0;
  }

  flip(k: number): void {
    if (k <= 1 || k > this.arr.length) {
      return;
    }

    let left = 0;
    let right = k - 1;

    while (left < right) {
      const temp = this.arr[left]!;
      this.arr[left] = this.arr[right]!;
      this.arr[right] = temp;
      left++;
      right--;
    }

    this.flipCount++;
  }

  sort(): T[] {
    const n = this.arr.length;

    for (let currSize = n; currSize > 1; currSize--) {
      let maxIdx = 0;

      for (let i = 1; i < currSize; i++) {
        if (this.comparator(this.arr[i]!, this.arr[maxIdx]!) > 0) {
          maxIdx = i;
        }
      }

      if (maxIdx !== currSize - 1) {
        if (maxIdx !== 0) {
          this.flip(maxIdx + 1);
        }
        this.flip(currSize);
      }
    }

    return this.arr;
  }

  isSorted(): boolean {
    for (let i = 0; i < this.arr.length - 1; i++) {
      if (this.comparator(this.arr[i]!, this.arr[i + 1]!) > 0) {
        return false;
      }
    }
    return true;
  }

  getFlipCount(): number {
    return this.flipCount;
  }

  toArray(): T[] {
    return [...this.arr];
  }

  getTimeComplexity(): string {
    return 'O(n²)';
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
    return `PancakeSort()`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }
}
