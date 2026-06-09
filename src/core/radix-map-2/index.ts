export class RadixMap2<T> {
  private _entries: [number, T][];
  private _size: number;

  constructor() {
    this._entries = [];
    this._size = 0;
  }

  set(key: number, value: T): void {
    const index = this.findKeyIndex(key);
    if (index !== -1) {
      this._entries[index]![1] = value;
    } else {
      this._entries.push([key, value]);
      this._size++;
      this.radixSort();
    }
  }

  get(key: number): T | undefined {
    const index = this.findKeyIndex(key);
    return index !== -1 ? this._entries[index]![1] : undefined;
  }

  has(key: number): boolean {
    return this.findKeyIndex(key) !== -1;
  }

  delete(key: number): boolean {
    const index = this.findKeyIndex(key);
    if (index !== -1) {
      this._entries.splice(index, 1);
      this._size--;
      return true;
    }
    return false;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  min(): number | undefined {
    return this._size > 0 ? this._entries[0]![0] : undefined;
  }

  max(): number | undefined {
    return this._size > 0 ? this._entries[this._size - 1]![0] : undefined;
  }

  keys(): number[] {
    return this._entries.map(entry => entry[0]);
  }

  values(): T[] {
    return this._entries.map(entry => entry[1]);
  }

  entries(): [number, T][] {
    return this._entries.map(entry => [entry[0], entry[1]]);
  }

  clear(): void {
    this._entries = [];
    this._size = 0;
  }

  private findKeyIndex(key: number): number {
    let left = 0;
    let right = this._size - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midKey = this._entries[mid]![0];

      if (midKey === key) {
        return mid;
      } else if (midKey < key) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return -1;
  }

  private radixSort(): void {
    if (this._size <= 1) {
      return;
    }

    const n = this._size;
    const output: [number, T][] = new Array(n);
    let exp = 1;
    let maxAbs = 0;

    for (let i = 0; i < n; i++) {
      const absKey = Math.abs(this._entries[i]![0]);
      if (absKey > maxAbs) {
        maxAbs = absKey;
      }
    }

    while (maxAbs / exp >= 1) {
      const count = new Array(10).fill(0);

      for (let i = 0; i < n; i++) {
        const digit = Math.floor(Math.abs(this._entries[i]![0]) / exp) % 10;
        count[digit]++;
      }

      for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
      }

      for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(Math.abs(this._entries[i]![0]) / exp) % 10;
        output[count[digit] - 1] = this._entries[i]!;
        count[digit]--;
      }

      for (let i = 0; i < n; i++) {
        this._entries[i] = output[i]!;
      }

      exp *= 10;
    }

    const negatives: [number, T][] = [];
    const positives: [number, T][] = [];

    for (let i = 0; i < n; i++) {
      const entry = this._entries[i]!;
      if (entry[0] < 0) {
        negatives.push(entry);
      } else {
        positives.push(entry);
      }
    }

    negatives.reverse();
    this._entries = [...negatives, ...positives];
  }
  *[Symbol.iterator]() {
    yield* this.entries()
  }

  forEach(callback: (entry: [number, T], index: number) => void): void {
    const items = this.entries()
    for (let i = 0; i < items.length; i++) {
      callback(items[i]!, i)
    }
  }

  toArray() {
    return this.entries()
  }
}
