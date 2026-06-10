export class TernarySearch {
  private array: number[];

  constructor(sortedArray: number[]) {
    this.array = [...sortedArray];
  }

  private ternarySearchRecursive(left: number, right: number, target: number): number {
    if (right < left) {
      return -1;
    }

    const third = Math.floor((right - left) / 3);
    const mid1 = left + third;
    const mid2 = right - third;

    if (this.array[mid1]! === target) {
      return mid1;
    }

    if (this.array[mid2]! === target) {
      return mid2;
    }

    if (target < this.array[mid1]!) {
      return this.ternarySearchRecursive(left, mid1 - 1, target);
    }

    if (target > this.array[mid2]!) {
      return this.ternarySearchRecursive(mid2 + 1, right, target);
    }

    return this.ternarySearchRecursive(mid1 + 1, mid2 - 1, target);
  }

  search(target: number): number {
    if (this.array.length === 0) {
      return -1;
    }

    return this.ternarySearchRecursive(0, this.array.length - 1, target);
  }

  indexOf(target: number): number {
    return this.search(target);
  }

  contains(target: number): boolean {
    return this.search(target) !== -1;
  }

  findMin(): number {
    if (this.array.length === 0) {
      throw new Error('Array is empty');
    }

    return this.array[0]!;
  }

  findMax(): number {
    if (this.array.length === 0) {
      throw new Error('Array is empty');
    }

    return this.array[this.array.length - 1]!;
  }

  closestTo(target: number): number {
    if (this.array.length === 0) {
      throw new Error('Array is empty');
    }

    let closest = this.array[0]!;
    let minDiff = Math.abs(target - closest);

    for (let i = 1; i < this.array.length; i++) {
      const diff = Math.abs(target - this.array[i]!);
      if (diff < minDiff) {
        minDiff = diff;
        closest = this.array[i]!;
      }
    }

    return closest;
  }

  rangeSearch(min: number, max: number): number[] {
    if (this.array.length === 0) {
      return [];
    }

    const result: number[] = [];

    for (let i = 0; i < this.array.length; i++) {
      const value = this.array[i]!;
      if (value >= min && value <= max) {
        result.push(value);
      }
    }

    return result;
  }

  getTimeComplexity(): string {
    return 'O(log3 n)';
  }

  has(target: number): boolean {
    return this.contains(target)
  }

  toString(): string {
    return `TernarySearch()`
  }

  get [Symbol.toStringTag](): string {
    return 'TernarySearch'
  }
}
