export class RoaringBitmap3 {
  private data: Map<number, boolean>;

  constructor() {
    this.data = new Map();
  }

  add(value: number): void {
    this.data.set(value, true);
  }

  has(value: number): boolean {
    return this.data.has(value);
  }

  delete(value: number): boolean {
    return this.data.delete(value);
  }

  and(other: RoaringBitmap3): RoaringBitmap3 {
    const result = new RoaringBitmap3();
    for (const [value] of this.data) {
      if (other.has(value)) {
        result.add(value);
      }
    }
    return result;
  }

  or(other: RoaringBitmap3): RoaringBitmap3 {
    const result = new RoaringBitmap3();
    for (const [value] of this.data) {
      result.add(value);
    }
    for (const [value] of other.data) {
      result.add(value);
    }
    return result;
  }

  xor(other: RoaringBitmap3): RoaringBitmap3 {
    const result = new RoaringBitmap3();
    for (const [value] of this.data) {
      if (!other.has(value)) {
        result.add(value);
      }
    }
    for (const [value] of other.data) {
      if (!this.has(value)) {
        result.add(value);
      }
    }
    return result;
  }

  get size(): number {
    return this.data.size;
  }

  isEmpty(): boolean {
    return this.data.size === 0;
  }

  clear(): void {
    this.data.clear();
  }

  min(): number | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    let min = Infinity;
    for (const value of this.data.keys()) {
      if (value < min) {
        min = value;
      }
    }
    return min;
  }

  max(): number | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    let max = -Infinity;
    for (const value of this.data.keys()) {
      if (value > max) {
        max = value;
      }
    }
    return max;
  }

  toArray(): number[] {
    return Array.from(this.data.keys()).sort((a, b) => a - b);
  }

  forEach(callback: (value: number) => void): void {
    const sorted = this.toArray();
    for (let i = 0; i < sorted.length; i++) {
      callback(sorted[i]!);
    }
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toString(): string {
    return `RoaringBitmap3({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'RoaringBitmap3', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'RoaringBitmap3'
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
