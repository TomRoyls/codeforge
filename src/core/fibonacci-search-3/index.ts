export class FibonacciSearch3<T = number> {
  private comparator: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.comparator = comparator ?? ((a: T, b: T) => {
      const numA = a as unknown as number;
      const numB = b as unknown as number;
      return numA - numB;
    });
  }

  search(arr: T[], target: T): number {
    const n = arr.length;
    if (n === 0) return -1;

    let fibM2 = 0;
    let fibM1 = 1;
    let fibM = fibM2 + fibM1;

    while (fibM < n) {
      fibM2 = fibM1;
      fibM1 = fibM;
      fibM = fibM2 + fibM1;
    }

    let offset = -1;

    while (fibM > 1) {
      const i = Math.min(offset + fibM2, n - 1);

      if (this.comparator(arr[i]!, target) < 0) {
        fibM = fibM1;
        fibM1 = fibM2;
        fibM2 = fibM - fibM1;
        offset = i;
      } else if (this.comparator(arr[i]!, target) > 0) {
        fibM = fibM2;
        fibM1 = fibM1 - fibM2;
        fibM2 = fibM - fibM1;
      } else {
        return i;
      }
    }

    if (fibM1 === 1 && arr[offset + 1]! !== undefined && this.comparator(arr[offset + 1]!, target) === 0) {
      return offset + 1;
    }

    return -1;
  }

  searchFirst(arr: T[], target: T): number {
    const n = arr.length;
    if (n === 0) return -1;

    let fibM2 = 0;
    let fibM1 = 1;
    let fibM = fibM2 + fibM1;

    while (fibM < n) {
      fibM2 = fibM1;
      fibM1 = fibM;
      fibM = fibM2 + fibM1;
    }

    let offset = -1;
    let result = -1;

    while (fibM > 1) {
      const i = Math.min(offset + fibM2, n - 1);

      if (this.comparator(arr[i]!, target) < 0) {
        fibM = fibM1;
        fibM1 = fibM2;
        fibM2 = fibM - fibM1;
        offset = i;
      } else if (this.comparator(arr[i]!, target) > 0) {
        fibM = fibM2;
        fibM1 = fibM1 - fibM2;
        fibM2 = fibM - fibM1;
      } else {
        result = i;
        fibM = fibM2;
        fibM1 = fibM1 - fibM2;
        fibM2 = fibM - fibM1;
      }
    }

    if (fibM1 === 1 && arr[offset + 1]! !== undefined && this.comparator(arr[offset + 1]!, target) === 0) {
      return offset + 1;
    }

    return result;
  }

  searchLast(arr: T[], target: T): number {
    const n = arr.length;
    if (n === 0) return -1;

    let fibM2 = 0;
    let fibM1 = 1;
    let fibM = fibM2 + fibM1;

    while (fibM < n) {
      fibM2 = fibM1;
      fibM1 = fibM;
      fibM = fibM2 + fibM1;
    }

    let offset = -1;
    let result = -1;

    while (fibM > 1) {
      const i = Math.min(offset + fibM2, n - 1);

      if (this.comparator(arr[i]!, target) <= 0) {
        if (this.comparator(arr[i]!, target) === 0) {
          result = i;
        }
        fibM = fibM1;
        fibM1 = fibM2;
        fibM2 = fibM - fibM1;
        offset = i;
      } else {
        fibM = fibM2;
        fibM1 = fibM1 - fibM2;
        fibM2 = fibM - fibM1;
      }
    }

    if (fibM1 === 1 && arr[offset + 1]! !== undefined && this.comparator(arr[offset + 1]!, target) === 0) {
      return offset + 1;
    }

    return result;
  }

  searchRange(arr: T[], target: T): [number, number] {
    const first = this.searchFirst(arr, target);
    if (first === -1) return [-1, -1];
    const last = this.searchLast(arr, target);
    return [first, last];
  }

  toString(): string {
    return `FibonacciSearch3()`
  }
}
