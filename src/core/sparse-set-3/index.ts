export class SparseSet3 {
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

  delete(value: number): boolean {
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

  contains(value: number): boolean {
    return this.has(value);
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.n = 0;
    this._size = 0;
  }

  getTimeComplexity(): { operation: string; complexity: string }[] {
    return [
      { operation: 'add', complexity: 'O(1)' },
      { operation: 'delete', complexity: 'O(1)' },
      { operation: 'has', complexity: 'O(1)' },
      { operation: 'contains', complexity: 'O(1)' },
      { operation: 'size', complexity: 'O(1)' },
      { operation: 'isEmpty', complexity: 'O(1)' },
      { operation: 'clear', complexity: 'O(1)' },
      { operation: 'forEach', complexity: 'O(n)' },
      { operation: 'filter', complexity: 'O(n)' },
      { operation: 'map', complexity: 'O(n)' },
      { operation: 'reduce', complexity: 'O(n)' },
      { operation: 'toArray', complexity: 'O(n)' },
      { operation: 'bulkInsert', complexity: 'O(k)' },
      { operation: 'union', complexity: 'O(n + m)' },
      { operation: 'intersection', complexity: 'O(min(n, m))' },
      { operation: 'difference', complexity: 'O(n + m)' }
    ];
  }

  forEach(callback: (value: number) => void): void {
    for (let i = 0; i < this.n; i++) {
      callback(this.dense[i]!);
    }
  }

  filter(predicate: (value: number) => boolean): SparseSet3 {
    const result = new SparseSet3(this.universeSize);
    for (let i = 0; i < this.n; i++) {
      const value = this.dense[i]!;
      if (predicate(value)) {
        result.add(value);
      }
    }
    return result;
  }

  map<U>(mapper: (value: number) => U): U[] {
    const result: U[] = [];
    for (let i = 0; i < this.n; i++) {
      result.push(mapper(this.dense[i]!));
    }
    return result;
  }

  reduce<T>(reducer: (accumulator: T, value: number) => T, initialValue: T): T {
    let accumulator = initialValue;
    for (let i = 0; i < this.n; i++) {
      accumulator = reducer(accumulator, this.dense[i]!);
    }
    return accumulator;
  }

  toArray(): number[] {
    return this.dense.slice(0, this.n);
  }

  bulkInsert(values: number[]): void {
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (value !== undefined && value >= 0 && value < this.universeSize) {
        this.add(value);
      }
    }
  }

  union(other: SparseSet3): SparseSet3 {
    if (this.universeSize !== other.universeSize) {
      throw new Error('Cannot union sets with different universe sizes');
    }

    const result = new SparseSet3(this.universeSize);
    for (let i = 0; i < this.n; i++) {
      result.add(this.dense[i]!);
    }
    for (let i = 0; i < other.n; i++) {
      result.add(other.dense[i]!);
    }
    return result;
  }

  intersection(other: SparseSet3): SparseSet3 {
    if (this.universeSize !== other.universeSize) {
      throw new Error('Cannot intersect sets with different universe sizes');
    }

    const result = new SparseSet3(this.universeSize);
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

  difference(other: SparseSet3): SparseSet3 {
    if (this.universeSize !== other.universeSize) {
      throw new Error('Cannot compute difference of sets with different universe sizes');
    }

    const result = new SparseSet3(this.universeSize);
    for (let i = 0; i < this.n; i++) {
      const value = this.dense[i]!;
      if (!other.has(value)) {
        result.add(value);
      }
    }
    return result;
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
}
