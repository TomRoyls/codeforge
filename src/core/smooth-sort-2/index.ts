import { CompareFn } from '../types.js';

export class SmoothSort2 {
  private comparisons: number = 0;
  private swaps: number = 0;
  private compareFn: CompareFn<number>;
  private leonardoNumbers: number[] = [];

  constructor(compare?: CompareFn<number>) {
    this.compareFn = compare || ((a: number, b: number) => a - b);
    this.generateLeonardoNumbers(100);
  }

  private compare(a: number, b: number): number {
    this.comparisons++;
    return this.compareFn(a, b);
  }

  private generateLeonardoNumbers(maxSize: number): void {
    this.leonardoNumbers = [1, 1];
    while (this.leonardoNumbers[this.leonardoNumbers.length - 1] + this.leonardoNumbers[this.leonardoNumbers.length - 2] + 1 <= maxSize) {
      const next = this.leonardoNumbers[this.leonardoNumbers.length - 1] + this.leonardoNumbers[this.leonardoNumbers.length - 2] + 1;
      this.leonardoNumbers.push(next);
    }
  }

  private getLeonardoNumber(k: number): number {
    if (k < this.leonardoNumbers.length) {
      return this.leonardoNumbers[k]!;
    }
    while (k >= this.leonardoNumbers.length) {
      const next = this.leonardoNumbers[this.leonardoNumbers.length - 1] + this.leonardoNumbers[this.leonardoNumbers.length - 2] + 1;
      this.leonardoNumbers.push(next);
    }
    return this.leonardoNumbers[k]!;
  }

  sort(arr: number[]): number[] {
    const copy = arr.slice();
    this.sortInPlace(copy);
    return copy;
  }

  sortInPlace(arr: number[]): void {
    const n = arr.length;
    if (n <= 1) {
      return;
    }

    const heap: number[] = [];
    const sizes: number[] = [];

    for (let i = 0; i < n; i++) {
      this.insertIntoHeap(arr, heap, sizes, i);
    }

    for (let i = n - 1; i >= 0; i--) {
      const k = sizes.pop()!;
      const root = heap.pop()!;
      arr[i] = arr[root];
      this.swaps++;
      if (k > 1) {
        const l = sizes[sizes.length - 1]!;
        const r = sizes[sizes.length - 2]!;
        this.siftDown(arr, heap, sizes, root, k, l, r);
      }
    }
  }

  private insertIntoHeap(arr: number[], heap: number[], sizes: number[], idx: number): void {
    let k = 1;
    while (this.getLeonardoNumber(k) < heap.length + 1) {
      k++;
    }

    while (k > 0 && heap.length + this.getLeonardoNumber(k) > idx + 1) {
      k--;
    }

    heap.push(idx);
    sizes.push(k);

    this.siftDown(arr, heap, sizes, idx, k, -1, -1);
  }

  private siftDown(arr: number[], heap: number[], sizes: number[], idx: number, k: number, l: number, r: number): void {
    while (k > 1) {
      let largest = idx;
      let lk = this.leonardoNumbers[k - 2]!;
      let rk = this.leonardoNumbers[k - 1]!;

      if (l >= 0 && this.compare(arr[idx + lk - 1], arr[largest]) > 0) {
        largest = idx + lk - 1;
      }
      if (r >= 0 && this.compare(arr[idx + lk + rk - 1], arr[largest]) > 0) {
        largest = idx + lk + rk - 1;
      }

      if (largest === idx) {
        break;
      }

      const temp = arr[idx];
      arr[idx] = arr[largest];
      arr[largest] = temp;
      this.swaps++;

      if (largest === idx + lk - 1) {
        k = k - 1;
        idx = largest;
      } else {
        k = k - 2;
        idx = largest;
      }

      if (k > 1) {
        lk = this.leonardoNumbers[k - 2]!;
        rk = this.leonardoNumbers[k - 1]!;
        if (idx + lk - 1 < arr.length) {
          l = idx - lk + 1;
        }
        if (idx + lk + rk - 1 < arr.length) {
          r = idx - lk - rk + 1;
        }
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
}
