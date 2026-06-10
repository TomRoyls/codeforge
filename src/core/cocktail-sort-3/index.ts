export class CocktailSort3<T> {
  private passCount: number;
  private swapCount: number;

  constructor() {
    this.passCount = 0;
    this.swapCount = 0;
  }

  sort(arr: T[]): T[] {
    const result = [...arr];
    this.passCount = 0;
    this.swapCount = 0;

    if (result.length <= 1) {
      return result;
    }

    this.cocktailSort(result);

    return result;
  }

  sortDescending(arr: T[]): T[] {
    const result = [...arr];
    this.passCount = 0;
    this.swapCount = 0;

    if (result.length <= 1) {
      return result;
    }

    this.cocktailSortDescending(result);

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
    this.swapCount++;
  }

  private cocktailSort(arr: T[]): void {
    let start = 0;
    let end = arr.length - 1;
    let swapped = true;

    while (swapped) {
      swapped = false;
      let lastSwapForward = start;

      for (let i = start; i < end; i++) {
        if (arr[i]! > arr[i + 1]!) {
          this.swap(arr, i, i + 1);
          swapped = true;
          lastSwapForward = i;
        }
      }

      this.passCount++;

      if (!swapped) {
        break;
      }

      swapped = false;
      end = lastSwapForward;
      let lastSwapBackward = end;

      for (let i = end; i > start; i--) {
        if (arr[i]! < arr[i - 1]!) {
          this.swap(arr, i, i - 1);
          swapped = true;
          lastSwapBackward = i;
        }
      }

      this.passCount++;
      start = lastSwapBackward;
    }
  }

  private cocktailSortDescending(arr: T[]): void {
    let start = 0;
    let end = arr.length - 1;
    let swapped = true;

    while (swapped) {
      swapped = false;
      let lastSwapForward = start;

      for (let i = start; i < end; i++) {
        if (arr[i]! < arr[i + 1]!) {
          this.swap(arr, i, i + 1);
          swapped = true;
          lastSwapForward = i;
        }
      }

      this.passCount++;

      if (!swapped) {
        break;
      }

      swapped = false;
      end = lastSwapForward;
      let lastSwapBackward = end;

      for (let i = end; i > start; i--) {
        if (arr[i]! > arr[i - 1]!) {
          this.swap(arr, i, i - 1);
          swapped = true;
          lastSwapBackward = i;
        }
      }

      this.passCount++;
      start = lastSwapBackward;
    }
  }

  clear(): void {
    this.passCount = 0
    this.swapCount = 0
  }

  toString(): string {
    return `CocktailSort3()`
  }

  static empty<T>(): CocktailSort3<T> {
    return new CocktailSort3<T>()
  }

  get [Symbol.toStringTag](): string {
    return 'CocktailSort3'
  }
}
