export class PigeonholeSort3 {
  private array: number[];
  private min: number;
  private max: number;

  constructor(array: number[]) {
    this.array = [...array];
    if (array.length === 0) {
      this.min = 0;
      this.max = 0;
      return;
    }
    const result = this.findMinMax();
    this.min = result.min;
    this.max = result.max;
  }

  sort(): number[] {
    if (this.array.length === 0) {
      return [];
    }
    if (this.array.length === 1) {
      return [...this.array];
    }

    const range = this.max - this.min + 1;
    const holes: number[][] = new Array(range).fill(null).map(() => []);

    for (let i = 0; i < this.array.length; i++) {
      const value = this.array[i]!;
      const index = value - this.min;
      holes[index]!.push(value);
    }

    const result: number[] = [];
    for (let i = 0; i < holes.length; i++) {
      const hole = holes[i]!;
      for (let j = 0; j < hole.length; j++) {
        result.push(hole[j]!);
      }
    }

    return result;
  }

  sortDescending(): number[] {
    const sorted = this.sort();
    return sorted.reverse();
  }

  isSorted(): boolean {
    if (this.array.length <= 1) {
      return true;
    }

    for (let i = 1; i < this.array.length; i++) {
      if (this.array[i]! < this.array[i - 1]!) {
        return false;
      }
    }

    return true;
  }

  findRange(): number {
    if (this.array.length === 0) {
      return 0;
    }
    return this.max - this.min + 1;
  }

  findMinMax(): { min: number; max: number } {
    if (this.array.length === 0) {
      return { min: 0, max: 0 };
    }

    let localMin = this.array[0]!;
    let localMax = this.array[0]!;

    for (let i = 1; i < this.array.length; i++) {
      const value = this.array[i]!;
      if (value < localMin) {
        localMin = value;
      }
      if (value > localMax) {
        localMax = value;
      }
    }

    return { min: localMin, max: localMax };
  }

  getTimeComplexity(): string {
    const n = this.array.length;
    const k = this.findRange();
    return `O(n + k) = O(${n} + ${k})`;
  }

  getSpaceComplexity(): string {
    const n = this.array.length;
    const k = this.findRange();
    return `O(n + k) = O(${n} + ${k})`;
  }

  clear(): void {
    this.array = []
    this.min = 0
    this.max = 0
  }

  toString(): string {
    return `PigeonholeSort3()`
  }

  get [Symbol.toStringTag](): string {
    return 'PigeonholeSort3'
  }
}
