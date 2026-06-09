export class EscapeSort {
  static sort<T>(arr: T[], comparator?: (a: T, b: T) => number): T[] {
    const cmp = comparator ?? ((a: T, b: T): number => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    const result = [...arr];
    const n = result.length;
    if (n <= 1) return result;

    let start = 0;
    let end = n - 1;

    while (start < end) {
      let swapped = false;

      // Forward pass: elements "escape" right to their correct position
      for (let i = start; i < end; i++) {
        if (cmp(result[i]!, result[i + 1]!) > 0) {
          const tmp = result[i]!;
          result[i] = result[i + 1]!;
          result[i + 1] = tmp;
          swapped = true;
        }
      }

      if (!swapped) break;
      end--;

      swapped = false;

      // Backward pass: elements "escape" left to their correct position
      for (let i = end; i > start; i--) {
        if (cmp(result[i - 1]!, result[i]!) > 0) {
          const tmp = result[i - 1]!;
          result[i - 1] = result[i]!;
          result[i] = tmp;
          swapped = true;
        }
      }

      if (!swapped) break;
      start++;
    }

    return result;
  }

  static sortInPlace<T>(arr: T[], comparator?: (a: T, b: T) => number): T[] {
    const cmp = comparator ?? ((a: T, b: T): number => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    const n = arr.length;
    if (n <= 1) return arr;

    let start = 0;
    let end = n - 1;

    while (start < end) {
      let swapped = false;

      for (let i = start; i < end; i++) {
        if (cmp(arr[i]!, arr[i + 1]!) > 0) {
          const tmp = arr[i]!;
          arr[i] = arr[i + 1]!;
          arr[i + 1] = tmp;
          swapped = true;
        }
      }

      if (!swapped) break;
      end--;

      swapped = false;

      for (let i = end; i > start; i--) {
        if (cmp(arr[i - 1]!, arr[i]!) > 0) {
          const tmp = arr[i - 1]!;
          arr[i - 1] = arr[i]!;
          arr[i] = tmp;
          swapped = true;
        }
      }

      if (!swapped) break;
      start++;
    }

    return arr;
  }

  static isSorted<T>(arr: T[], comparator?: (a: T, b: T) => number): boolean {
    const cmp = comparator ?? ((a: T, b: T): number => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    for (let i = 0; i < arr.length - 1; i++) {
      if (cmp(arr[i]!, arr[i + 1]!) > 0) {
        return false;
      }
    }
    return true;
  }

  toString(): string {
    return `EscapeSort()`
  }
}
