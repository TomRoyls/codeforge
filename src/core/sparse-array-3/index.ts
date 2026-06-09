export class SparseArray3<T> {
  private _length: number;
  private data: Map<number, T>;

  constructor(length: number = 0) {
    this._length = Math.max(0, length);
    this.data = new Map();
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) {
      return undefined;
    }
    return this.data.get(index);
  }

  set(index: number, value: T): void {
    if (index < 0) {
      throw new RangeError('Index cannot be negative');
    }
    if (index >= this._length) {
      this._length = index + 1;
    }
    this.data.set(index, value);
  }

  delete(index: number): boolean {
    if (index < 0 || index >= this._length) {
      return false;
    }
    return this.data.delete(index);
  }

  has(index: number): boolean {
    if (index < 0 || index >= this._length) {
      return false;
    }
    return this.data.has(index);
  }

  push(value: T): number {
    const newIndex = this._length;
    this.data.set(newIndex, value);
    this._length++;
    return newIndex;
  }

  pop(): T | undefined {
    if (this._length === 0) {
      return undefined;
    }
    let lastIndex = this._length - 1;
    while (lastIndex >= 0 && !this.data.has(lastIndex)) {
      lastIndex--;
    }
    if (lastIndex < 0) {
      this._length = 0;
      return undefined;
    }
    const value = this.data.get(lastIndex);
    this.data.delete(lastIndex);
    this._length = lastIndex;
    return value;
  }

  get length(): number {
    return this._length;
  }

  setLength(n: number): void {
    if (n < 0) {
      throw new RangeError('Length cannot be negative');
    }
    for (const key of this.data.keys()) {
      if (key >= n) {
        this.data.delete(key);
      }
    }
    this._length = n;
  }

  filled(): number {
    return this.data.size;
  }

  filledIndices(): number[] {
    return Array.from(this.data.keys()).sort((a, b) => a - b);
  }

  toArray(): (T | undefined)[] {
    const result: (T | undefined)[] = new Array(this._length);
    for (const [index, value] of this.data) {
      result[index] = value;
    }
    return result;
  }

  compact(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._length; i++) {
      const value = this.data.get(i);
      if (value !== undefined) {
        result.push(value);
      }
    }
    return result;
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (const [index, value] of this.data) {
      if (index < this._length) {
        callback(value, index);
      }
    }
  }

  clear(): void {
    this.data.clear();
    this._length = 0;
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
    return `SparseArray3()`
  }

  toJSON() {
    return { type: 'SparseArray3', items: this.toArray() }
  }
}
