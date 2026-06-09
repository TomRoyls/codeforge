export class FibonacciSearch {
  private array: number[];
  private n: number;

  constructor(sortedArray: number[]) {
    this.array = [...sortedArray];
    this.n = this.array.length;
  }

  search(target: number): number {
    if (this.n === 0) {
      return -1;
    }

    let fibM2 = 0;
    let fibM1 = 1;
    let fibM = fibM2 + fibM1;

    while (fibM < this.n) {
      fibM2 = fibM1;
      fibM1 = fibM;
      fibM = fibM2 + fibM1;
    }

    let offset = -1;

    while (fibM > 1) {
      const i = Math.min(offset + fibM2, this.n - 1);

      if (this.array[i]! < target) {
        fibM = fibM1;
        fibM1 = fibM2;
        fibM2 = fibM - fibM1;
        offset = i;
      } else if (this.array[i]! > target) {
        fibM = fibM2;
        fibM1 = fibM1 - fibM2;
        fibM2 = fibM - fibM1;
      } else {
        return i;
      }
    }

    if (fibM1 && offset + 1 < this.n && this.array[offset + 1]! === target) {
      return offset + 1;
    }

    return -1;
  }

  indexOf(target: number): number {
    return this.search(target);
  }

  contains(target: number): boolean {
    return this.search(target) !== -1;
  }

  closestTo(target: number): number {
    if (this.n === 0) {
      throw new Error('Array is empty');
    }

    const index = this.search(target);
    if (index !== -1) {
      return this.array[index]!;
    }

    let fibM2 = 0;
    let fibM1 = 1;
    let fibM = fibM2 + fibM1;

    while (fibM < this.n) {
      fibM2 = fibM1;
      fibM1 = fibM;
      fibM = fibM2 + fibM1;
    }

    let offset = -1;
    let insertionPoint = 0;

    while (fibM > 1) {
      const i = Math.min(offset + fibM2, this.n - 1);

      if (this.array[i]! < target) {
        fibM = fibM1;
        fibM1 = fibM2;
        fibM2 = fibM - fibM1;
        offset = i;
      } else if (this.array[i]! > target) {
        fibM = fibM2;
        fibM1 = fibM1 - fibM2;
        fibM2 = fibM - fibM1;
      } else {
        return this.array[i]!;
      }
    }

    if (fibM1 && offset + 1 < this.n && this.array[offset + 1]! <= target) {
      insertionPoint = offset + 1;
    } else {
      insertionPoint = offset + 1;
    }

    if (insertionPoint < 0) {
      insertionPoint = 0;
    }

    if (insertionPoint > this.n) {
      insertionPoint = this.n;
    }

    const lowerIndex = insertionPoint - 1;
    const upperIndex = insertionPoint < this.n ? insertionPoint : -1;

    let closestValue: number;

    if (lowerIndex >= 0 && upperIndex >= 0) {
      const lowerValue = this.array[lowerIndex]!;
      const upperValue = this.array[upperIndex]!;
      const lowerDiff = Math.abs(target - lowerValue);
      const upperDiff = Math.abs(target - upperValue);

      if (lowerDiff < upperDiff) {
        closestValue = lowerValue;
      } else {
        closestValue = upperValue;
      }
    } else if (lowerIndex >= 0) {
      closestValue = this.array[lowerIndex]!;
    } else if (upperIndex >= 0) {
      closestValue = this.array[upperIndex]!;
    } else {
      closestValue = this.array[0]!;
    }

    return closestValue;
  }

  rangeSearch(min: number, max: number): number[] {
    if (this.n === 0 || min > max) {
      return [];
    }

    const result: number[] = [];
    const startIndex = this.findFirstIndex(min);
    if (startIndex === -1) {
      return result;
    }

    for (let i = startIndex; i < this.n; i++) {
      const val = this.array[i]!;
      if (val > max) {
        break;
      }
      result.push(val);
    }

    return result;
  }

  getTimeComplexity(): string {
    return 'O(log n)';
  }

  private findFirstIndex(target: number): number {
    let fibM2 = 0;
    let fibM1 = 1;
    let fibM = fibM2 + fibM1;

    while (fibM < this.n) {
      fibM2 = fibM1;
      fibM1 = fibM;
      fibM = fibM2 + fibM1;
    }

    let offset = -1;
    let firstIndex = -1;

    while (fibM > 1) {
      const i = Math.min(offset + fibM2, this.n - 1);

      if (this.array[i]! < target) {
        fibM = fibM1;
        fibM1 = fibM2;
        fibM2 = fibM - fibM1;
        offset = i;
      } else if (this.array[i]! >= target) {
        fibM = fibM2;
        fibM1 = fibM1 - fibM2;
        fibM2 = fibM - fibM1;
        if (firstIndex === -1 || i < firstIndex) {
          firstIndex = i;
        }
      }
    }

    if (fibM1 && offset + 1 < this.n && this.array[offset + 1]! >= target) {
      if (firstIndex === -1 || offset + 1 < firstIndex) {
        firstIndex = offset + 1;
      }
    }

    return firstIndex;
  }

  clear(): void {
    this.array = []
  }
}
