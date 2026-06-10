export class SpaghettiSort2 {
  private array: number[];

  constructor(array: number[]) {
    this.array = [...array];
  }

  sort(arr: number[]): number[] {
    if (arr.length === 0) {
      return [];
    }

    const result: number[] = [];
    const working = [...arr];

    while (working.length > 0) {
      const maxIndex = this.findMaxIndex(working);
      result.unshift(working[maxIndex]!);
      working.splice(maxIndex, 1);
    }

    return result;
  }

  sortDescending(arr: number[]): number[] {
    if (arr.length === 0) {
      return [];
    }

    const result: number[] = [];
    const working = [...arr];

    while (working.length > 0) {
      const minIndex = this.findMinIndex(working);
      result.unshift(working[minIndex]!);
      working.splice(minIndex, 1);
    }

    return result;
  }

  isSorted(arr: number[]): boolean {
    if (arr.length <= 1) {
      return true;
    }

    for (let i = 1; i < arr.length; i++) {
      if (arr[i]! < arr[i - 1]!) {
        return false;
      }
    }

    return true;
  }

  static findMax(arr: number[]): number | undefined {
    if (arr.length === 0) {
      return undefined;
    }

    let max = arr[0]!;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i]! > max) {
        max = arr[i]!;
      }
    }
    return max;
  }

  static findMin(arr: number[]): number | undefined {
    if (arr.length === 0) {
      return undefined;
    }

    let min = arr[0]!;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i]! < min) {
        min = arr[i]!;
      }
    }
    return min;
  }

  private findMaxIndex(arr: number[]): number {
    let maxIndex = 0;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i]! > arr[maxIndex]!) {
        maxIndex = i;
      }
    }
    return maxIndex;
  }

  private findMinIndex(arr: number[]): number {
    let minIndex = 0;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i]! < arr[minIndex]!) {
        minIndex = i;
      }
    }
    return minIndex;
  }

  getTimeComplexity(): string {
    const n = this.array.length;
    return `O(n²) = O(${n}²)`;
  }

  getSpaceComplexity(): string {
    const n = this.array.length;
    return `O(n) = O(${n})`;
  }

  toArray(): number[] {
    return [...this.array];
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
    return `SpaghettiSort2()`
  }

  toJSON() {
    return { type: 'SpaghettiSort2', items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'SpaghettiSort2'
  }
}
