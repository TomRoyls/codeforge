export class BubbleSort4<T> {
  private passCount: number;
  private lastSwapIndex: number;
  private cocktailMode: boolean;

  constructor(cocktailMode: boolean = false) {
    this.passCount = 0;
    this.lastSwapIndex = -1;
    this.cocktailMode = cocktailMode;
  }

  sort(arr: T[]): T[] {
    const result = [...arr];
    this.passCount = 0;
    this.lastSwapIndex = -1;

    if (result.length <= 1) {
      return result;
    }

    if (this.cocktailMode) {
      this.cocktailSort(result);
    } else {
      this.optimizedBubbleSort(result);
    }

    return result;
  }

  sortDescending(arr: T[]): T[] {
    const result = [...arr];
    this.passCount = 0;
    this.lastSwapIndex = -1;

    if (result.length <= 1) {
      return result;
    }

    if (this.cocktailMode) {
      this.cocktailSortDescending(result);
    } else {
      this.optimizedBubbleSortDescending(result);
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

  getLastSwapIndex(): number {
    return this.lastSwapIndex;
  }

  getPassCount(): number {
    return this.passCount;
  }

  private swap(arr: T[], i: number, j: number): void {
    const temp = arr[i]!;
    arr[i]! = arr[j]!;
    arr[j]! = temp;
  }

  private optimizedBubbleSort(arr: T[]): void {
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      let lastSwap = 0;

      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j]! > arr[j + 1]!) {
          this.swap(arr, j, j + 1);
          swapped = true;
          lastSwap = j;
        }
      }

      this.passCount++;
      this.lastSwapIndex = lastSwap;

      if (!swapped) {
        break;
      }
    }
  }

  private optimizedBubbleSortDescending(arr: T[]): void {
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      let lastSwap = 0;

      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j]! < arr[j + 1]!) {
          this.swap(arr, j, j + 1);
          swapped = true;
          lastSwap = j;
        }
      }

      this.passCount++;
      this.lastSwapIndex = lastSwap;

      if (!swapped) {
        break;
      }
    }
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
      this.lastSwapIndex = lastSwapForward;

      if (!swapped) {
        break;
      }

      swapped = false;
      end = lastSwapForward;
      let lastSwapBackward = end;

      for (let i = end; i > start; i--) {
        if (arr[i]! < arr[i - 1]!!) {
          this.swap(arr, i, i - 1);
          swapped = true;
          lastSwapBackward = i;
        }
      }

      this.passCount++;
      this.lastSwapIndex = lastSwapBackward;
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
      this.lastSwapIndex = lastSwapForward;

      if (!swapped) {
        break;
      }

      swapped = false;
      end = lastSwapForward;
      let lastSwapBackward = end;

      for (let i = end; i > start; i--) {
        if (arr[i]! > arr[i - 1]!!) {
          this.swap(arr, i, i - 1);
          swapped = true;
          lastSwapBackward = i;
        }
      }

      this.passCount++;
      this.lastSwapIndex = lastSwapBackward;
      start = lastSwapBackward;
    }
  }

  clear(): void {
    this.passCount = 0
  }

  toString(): string {
    return `BubbleSort4()`
  }
}
