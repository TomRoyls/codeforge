export class SmoothSort2 {
  private comparisons: number = 0;
  private swaps: number = 0;
  private compareFn: (a: number, b: number) => number;

  constructor(compare?: (a: number, b: number) => number) {
    this.compareFn = compare || ((a: number, b: number) => a - b);
  }

  private cmp(a: number, b: number): number {
    this.comparisons++;
    return this.compareFn(a, b);
  }

  private siftDown(arr: number[], start: number, end: number): void {
    let root = start;
    while (2 * root + 1 <= end) {
      let child = 2 * root + 1;
      if (child + 1 <= end && this.cmp(arr[child]!, arr[child + 1]!) < 0) {
        child++;
      }
      if (this.cmp(arr[root]!, arr[child]!) < 0) {
        const tmp = arr[root]!;
        arr[root] = arr[child]!;
        arr[child] = tmp;
        this.swaps++;
        root = child;
      } else {
        return;
      }
    }
  }

  sort(arr: number[]): number[] {
    const copy = arr.slice();
    this.sortInPlace(copy);
    return copy;
  }

  sortInPlace(arr: number[]): void {
    const n = arr.length;
    if (n <= 1) return;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      this.siftDown(arr, i, n - 1);
    }

    for (let i = n - 1; i > 0; i--) {
      const tmp = arr[0]!;
      arr[0] = arr[i]!;
      arr[i] = tmp;
      this.swaps++;
      this.siftDown(arr, 0, i - 1);
    }
  }

  isSorted(arr: number[]): boolean {
    for (let i = 0; i < arr.length - 1; i++) {
      if (this.cmp(arr[i]!, arr[i + 1]!) > 0) return false;
    }
    return true;
  }

  getComparisons(): number { return this.comparisons; }
  getSwaps(): number { return this.swaps; }
  resetCounters(): void { this.comparisons = 0; this.swaps = 0; }
}
