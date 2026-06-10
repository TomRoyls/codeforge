export class InterpolationSearch {
  private array: number[];

  constructor(sortedArray: number[]) {
    this.array = [...sortedArray];
  }

  search(target: number): number {
    if (this.array.length === 0) {
      return -1;
    }

    let low = 0;
    let high = this.array.length - 1;

    while (low <= high && target >= this.array[low]! && target <= this.array[high]!) {
      if (low === high) {
        if (this.array[low]! === target) {
          return low;
        }
        return -1;
      }

      const pos = Math.floor(
        low + ((target - this.array[low]!) / (this.array[high]! - this.array[low]!)) * (high - low)
      );

      if (this.array[pos]! === target) {
        return pos;
      }

      if (this.array[pos]! < target) {
        low = pos + 1;
      } else {
        high = pos - 1;
      }
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
    if (this.array.length === 0) {
      throw new Error('Array is empty');
    }

    const index = this.search(target);
    if (index !== -1) {
      return this.array[index]!;
    }

    let left = 0;
    let right = this.array.length - 1;

    while (left < right - 1) {
      const mid = Math.floor((left + right) / 2);
      if (this.array[mid]! < target) {
        left = mid;
      } else {
        right = mid;
      }
    }

    const leftDiff = Math.abs(this.array[left]! - target);
    const rightDiff = Math.abs(this.array[right]! - target);

    if (leftDiff < rightDiff) {
      return this.array[left]!;
    }
    if (rightDiff < leftDiff) {
      return this.array[right]!;
    }
    const midpoint = (this.array[left]! + this.array[right]!) / 2;
    if (target > midpoint) {
      return this.array[right]!;
    }
    return this.array[left]!;
  }

  rangeSearch(min: number, max: number): number[] {
    const result: number[] = [];

    for (let i = 0; i < this.array.length; i++) {
      const val = this.array[i]!;
      if (val >= min && val <= max) {
        result.push(val);
      }
    }

    return result;
  }

  insert(value: number): number {
    let low = 0;
    let high = this.array.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (this.array[mid]! < value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    this.array.splice(low, 0, value);
    return low;
  }

  getTimeComplexity(): string {
    return 'Average: O(log(log(n))), Worst: O(n))';
  }

  clear(): void {
    this.array = []
  }

  has(target: number): boolean {
    return this.contains(target)
  }

  toString(): string {
    return `InterpolationSearch()`
  }

  get [Symbol.toStringTag](): string {
    return 'InterpolationSearch'
  }

  includes(target: number): boolean {
    return this.contains(target)
  }
}
