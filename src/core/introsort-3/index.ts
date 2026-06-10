export class Introsort3 {
  private comparator: (a: number, b: number) => number;
  private comparisons: number;
  private swaps: number;

  constructor(comparator?: (a: number, b: number) => number) {
    this.comparator = comparator || ((a: number, b: number) => a - b);
    this.comparisons = 0;
    this.swaps = 0;
  }

  private compare(a: number, b: number): number {
    this.comparisons++;
    return this.comparator(a, b);
  }

  sort(arr: number[]): number[] {
    if (arr.length <= 1) {
      return arr.slice();
    }
    const copy = arr.slice();
    const maxDepth = this.getMaxDepth(copy.length);
    this.introSort(copy, 0, copy.length - 1, maxDepth);
    return copy;
  }

  getMaxDepth(n: number): number {
    if (n <= 1) {
      return 0;
    }
    return 2 * Math.floor(Math.log2(n));
  }

  sortWithMaxDepth(arr: number[], maxDepth: number): number[] {
    if (arr.length <= 1) {
      return arr.slice();
    }
    const copy = arr.slice();
    this.introSort(copy, 0, copy.length - 1, maxDepth);
    return copy;
  }

  private introSort(arr: number[], low: number, high: number, depthLimit: number): void {
    while (high - low > 16) {
      if (depthLimit === 0) {
        this.heapSort(arr, low, high);
        return;
      }
      depthLimit--;
      const pivotIndex = this.partition(arr, low, high);
      if (pivotIndex < low + (high - low) / 2) {
        this.introSort(arr, pivotIndex + 1, high, depthLimit);
        high = pivotIndex - 1;
      } else {
        this.introSort(arr, low, pivotIndex - 1, depthLimit);
        low = pivotIndex + 1;
      }
    }
    this.insertionSort(arr, low, high);
  }

  private partition(arr: number[], low: number, high: number): number {
    const mid = Math.floor((low + high) / 2);
    this.medianOfThree(arr, low, mid, high);
    const pivot = arr[high]!;

    let i = low;
    let j = low;
    let k = high;

    while (j <= k) {
      if (this.compare(arr[j]!, pivot) < 0) {
        [arr[i]!, arr[j]!] = [arr[j]!, arr[i]!];
        this.swaps++;
        i++;
        j++;
      } else if (this.compare(arr[j]!, pivot) > 0) {
        [arr[j]!, arr[k]!] = [arr[k]!, arr[j]!];
        this.swaps++;
        k--;
      } else {
        j++;
      }
    }

    return i;
  }

  private medianOfThree(arr: number[], low: number, mid: number, high: number): void {
    if (this.compare(arr[low]!, arr[mid]!) > 0) {
      [arr[low]!, arr[mid]!] = [arr[mid]!, arr[low]!];
      this.swaps++;
    }
    if (this.compare(arr[mid]!, arr[high]!) > 0) {
      [arr[mid]!, arr[high]!] = [arr[high]!, arr[mid]!];
      this.swaps++;
    }
    if (this.compare(arr[low]!, arr[mid]!) > 0) {
      [arr[low]!, arr[mid]!] = [arr[mid]!, arr[low]!];
      this.swaps++;
    }
  }

  private insertionSort(arr: number[], low: number, high: number): void {
    for (let i = low + 1; i <= high; i++) {
      const key = arr[i]!;
      let j = i - 1;
      while (j >= low && this.compare(arr[j]!, key) > 0) {
        arr[j + 1]! = arr[j]!;
        this.swaps++;
        j--;
      }
      arr[j + 1]! = key;
    }
  }

  private heapSort(arr: number[], low: number, high: number): void {
    const n = high - low + 1;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      this.heapify(arr, low, high, low + i);
    }
    for (let i = high; i > low; i--) {
      [arr[low]!, arr[i]!] = [arr[i]!, arr[low]!];
      this.swaps++;
      this.heapify(arr, low, i - 1, low);
    }
  }

  private heapify(arr: number[], low: number, high: number, root: number): void {
    let largest = root;
    const left = low + 2 * (root - low) + 1;
    const right = low + 2 * (root - low) + 2;

    if (left <= high && this.compare(arr[left]!, arr[largest]!) > 0) {
      largest = left;
    }
    if (right <= high && this.compare(arr[right]!, arr[largest]!) > 0) {
      largest = right;
    }
    if (largest !== root) {
      [arr[root]!, arr[largest]!] = [arr[largest]!, arr[root]!];
      this.swaps++;
      this.heapify(arr, low, high, largest);
    }
  }

  sortDescending(arr: number[]): number[] {
    return this.sort(arr).reverse();
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

  getTimeComplexity(): string {
    return 'O(n log n) average, O(n log n) worst, O(n log n) space';
  }

  getSpaceComplexity(): string {
    return 'O(log n) recursion stack';
  }

  toString(): string {
    return `Introsort3()`
  }

  get [Symbol.toStringTag](): string {
    return 'Introsort3'
  }
}
