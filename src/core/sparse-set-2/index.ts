export class SparseSet2 {
  private dense: number[];
  private sparse: number[];
  private n: number;
  private _size: number;
  private readonly universeSize: number;

  constructor(universeSize: number) {
    if (universeSize < 0) {
      throw new Error('Universe size must be non-negative');
    }
    this.universeSize = universeSize;
    this.dense = new Array(universeSize);
    this.sparse = new Array(universeSize);
    this.n = 0;
    this._size = 0;
  }

  add(value: number): boolean {
    if (value < 0 || value >= this.universeSize) {
      throw new Error(`Value must be non-negative and less than universe size (${this.universeSize})`);
    }

    if (this.has(value)) {
      return false;
    }

    this.dense[this.n] = value;
    this.sparse[value] = this.n;
    this.n++;
    this._size++;
    return true;
  }

  remove(value: number): boolean {
    if (value < 0 || value >= this.universeSize) {
      return false;
    }

    if (!this.has(value)) {
      return false;
    }

    const index = this.sparse[value]!;
    this.n--;
    this._size--;

    if (index < this.n) {
      const lastValue = this.dense[this.n]!;
      this.dense[index] = lastValue;
      this.sparse[lastValue] = index;
    }

    return true;
  }

  has(value: number): boolean {
    if (value < 0 || value >= this.universeSize) {
      return false;
    }
    const index = this.sparse[value]!;
    return index < this.n && this.dense[index] === value;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.n = 0;
    this._size = 0;
  }

  forEach(callback: (value: number) => void): void {
    for (let i = 0; i < this.n; i++) {
      callback(this.dense[i]!);
    }
  }

  toArray(): number[] {
    return this.dense.slice(0, this.n);
  }

  values(): number[] {
    return this.toArray();
  }

  [Symbol.iterator](): Iterator<number> {
    let index = 0;
    return {
      next: (): IteratorResult<number> => {
        if (index < this.n) {
          const value = this.dense[index]!;
          index++;
          return { value, done: false };
        }
        return { value: undefined as unknown as number, done: true };
      }
    };
  }

  min(): number | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    let min = this.dense[0]!;
    for (let i = 1; i < this.n; i++) {
      if (this.dense[i]! < min) {
        min = this.dense[i]!;
      }
    }
    return min;
  }

  max(): number | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    let max = this.dense[0]!;
    for (let i = 1; i < this.n; i++) {
      if (this.dense[i]! > max) {
        max = this.dense[i]!;
      }
    }
    return max;
  }

  union(other: SparseSet2): SparseSet2 {
    if (this.universeSize !== other.universeSize) {
      throw new Error('Cannot union sets with different universe sizes');
    }

    const result = new SparseSet2(this.universeSize);
    for (let i = 0; i < this.n; i++) {
      result.add(this.dense[i]!);
    }
    for (let i = 0; i < other.n; i++) {
      result.add(other.dense[i]!);
    }
    return result;
  }

  intersection(other: SparseSet2): SparseSet2 {
    if (this.universeSize !== other.universeSize) {
      throw new Error('Cannot intersect sets with different universe sizes');
    }

    const result = new SparseSet2(this.universeSize);
    const smaller = this.n < other.n ? this : other;
    const larger = this.n < other.n ? other : this;

    for (let i = 0; i < smaller.n; i++) {
      const value = smaller.dense[i]!;
      if (larger.has(value)) {
        result.add(value);
      }
    }
    return result;
  }

  toString(): string {
    return `SparseSet2({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SparseSet2', size: this.size, items: this.toArray() }
  }
}
