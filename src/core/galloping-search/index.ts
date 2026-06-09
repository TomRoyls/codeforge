export class GallopingSearch<T> {
  private array: T[];
  private compare: (a: T, b: T) => number;

  constructor(sortedArray: T[], comparator?: (a: T, b: T) => number) {
    this.array = [...sortedArray];
    this.compare = comparator || ((a: T, b: T) => {
      if (a === b) return 0;
      return (a as unknown as number) < (b as unknown as number) ? -1 : 1;
    });
  }

  private binarySearch(low: number, high: number, target: T): number {
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const cmp = this.compare(this.array[mid]!, target);
      if (cmp === 0) {
        return mid;
      } else if (cmp < 0) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return -1;
  }

  private gallopFindRange(target: T): { low: number; high: number } {
    if (this.array.length === 0) {
      return { low: 0, high: -1 };
    }

    const firstCmp = this.compare(this.array[0]!, target);
    if (firstCmp === 0) {
      return { low: 0, high: 0 };
    } else if (firstCmp > 0) {
      return { low: 0, high: -1 };
    }

    const lastCmp = this.compare(this.array[this.array.length - 1]!, target);
    if (lastCmp === 0) {
      return { low: this.array.length - 1, high: this.array.length - 1 };
    } else if (lastCmp < 0) {
      return { low: this.array.length, high: this.array.length - 1 };
    }

    let bound = 1;
    let index = 0;

    while (bound < this.array.length && this.compare(this.array[bound]!, target) < 0) {
      index = bound;
      bound *= 2;
    }

    const low = index;
    const high = Math.min(bound, this.array.length - 1);

    return { low, high };
  }

  search(target: T): number {
    const { low, high } = this.gallopFindRange(target);
    return this.binarySearch(low, high, target);
  }

  searchRange(target: T): [number, number] {
    const { low, high } = this.gallopFindRange(target);
    const result = this.binarySearch(low, high, target);

    if (result === -1) {
      return [-1, -1];
    }

    let first = result;
    while (first > 0 && this.compare(this.array[first - 1]!, target) === 0) {
      first--;
    }

    let last = result;
    while (last < this.array.length - 1 && this.compare(this.array[last + 1]!, target) === 0) {
      last++;
    }

    return [first, last];
  }

  insert(target: T): number {
    let low = 0;
    let high = this.array.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const cmp = this.compare(this.array[mid]!, target);
      if (cmp === 0) {
        this.array.splice(mid, 0, target);
        return mid;
      } else if (cmp < 0) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    this.array.splice(low, 0, target);
    return low;
  }

  contains(target: T): boolean {
    return this.search(target) !== -1;
  }

  indexOf(target: T): number {
    return this.search(target);
  }

  getTimeComplexity(): string {
    return 'O(log n) - Exponential search combines galloping phase O(log i) with binary search O(log n)';
  }

  has(target: T): boolean {
    return this.contains(target)
  }

  toString(): string {
    return `GallopingSearch()`
  }
}
