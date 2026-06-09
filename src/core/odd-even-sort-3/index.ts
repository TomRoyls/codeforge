export class OddEvenSort3<T> {
  private swapCount: number;
  private passCount: number;

  constructor() {
    this.swapCount = 0;
    this.passCount = 0;
  }

  sort(arr: T[]): T[] {
    const result = [...arr];
    this.swapCount = 0;
    this.passCount = 0;

    if (result.length <= 1) {
      return result;
    }

    let sorted = false;
    while (!sorted) {
      sorted = true;

      for (let i = 1; i < result.length; i += 2) {
        if (result[i]! < result[i - 1]!) {
          this.swap(result, i, i - 1);
          this.swapCount++;
          sorted = false;
        }
      }

      for (let i = 2; i < result.length; i += 2) {
        if (result[i]! < result[i - 1]!) {
          this.swap(result, i, i - 1);
          this.swapCount++;
          sorted = false;
        }
      }

      this.passCount++;
    }

    return result;
  }

  sortDescending(arr: T[]): T[] {
    const result = [...arr];
    this.swapCount = 0;
    this.passCount = 0;

    if (result.length <= 1) {
      return result;
    }

    let sorted = false;
    while (!sorted) {
      sorted = true;

      for (let i = 1; i < result.length; i += 2) {
        if (result[i]! > result[i - 1]!) {
          this.swap(result, i, i - 1);
          this.swapCount++;
          sorted = false;
        }
      }

      for (let i = 2; i < result.length; i += 2) {
        if (result[i]! > result[i - 1]!) {
          this.swap(result, i, i - 1);
          this.swapCount++;
          sorted = false;
        }
      }

      this.passCount++;
    }

    return result;
  }

  isSorted(arr: T[]): boolean {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i]! > arr[i + 1]!) {
        return false;
      }
    }
    return true;
  }

  getTimeComplexity(): string {
    return 'O(n²)';
  }

  getSpaceComplexity(): string {
    return 'O(1)';
  }

  getSwapCount(): number {
    return this.swapCount;
  }

  getPassCount(): number {
    return this.passCount;
  }

  private swap(arr: T[], i: number, j: number): void {
    const temp = arr[i]!;
    arr[i]! = arr[j]!;
    arr[j]! = temp;
  }

  clear(): void {
    this.swapCount = 0
    this.passCount = 0
  }

  toString(): string {
    return `OddEvenSort3()`
  }
}
