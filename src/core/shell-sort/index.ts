export class ShellSort<T> {
  private arr: T[];
  private comparator: (a: T, b: T) => number;
  private comparisons: number;
  private swaps: number;

  constructor(array: T[], comparator?: (a: T, b: T) => number) {
    this.arr = [...array];
    this.comparator = comparator ?? ((a: T, b: T): number => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this.comparisons = 0;
    this.swaps = 0;
  }

  sort(): T[] {
    const n = this.arr.length;
    let gap = 1;

    while (gap < n / 3) {
      gap = gap * 3 + 1;
    }

    while (gap > 0) {
      for (let i = gap; i < n; i++) {
        const temp = this.arr[i]!;
        let j = i;

        while (j >= gap) {
          this.comparisons++;
          if (this.comparator(this.arr[j - gap]!, temp) > 0) {
            this.arr[j] = this.arr[j - gap]!;
            this.swaps++;
            j = j - gap;
          } else {
            break;
          }
        }

        this.arr[j] = temp;
      }

      gap = Math.floor(gap / 3);
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

  getComparisons(): number {
    return this.comparisons;
  }

  getSwaps(): number {
    return this.swaps;
  }

  toArray(): T[] {
    return [...this.arr];
  }

  getTimeComplexity(): string {
    return 'O(n^(3/2))';
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
    return `ShellSort()`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'ShellSort', items: this.toArray() }
  }
}
