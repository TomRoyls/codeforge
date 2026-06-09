import type { Comparator, SortedArrayMapOptions, Entry } from "./types.js";

const defaultComparator: Comparator<number> = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

export class SortedArrayMap<K = number, V = unknown> {
  private _keys: K[] = [];
  private _values: V[] = [];
  private compare: Comparator<K>;

  constructor(options?: SortedArrayMapOptions<K>, entries?: Iterable<Entry<K, V>>) {
    this.compare = (options?.comparator ?? defaultComparator) as Comparator<K>;
    if (entries) {
      for (const entry of entries) {
        this.set(entry.key, entry.value);
      }
    }
  }

  private binarySearch(key: K): number {
    let lo = 0;
    let hi = this._keys.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const cmp = this.compare(this._keys[mid]!, key);
      if (cmp < 0) lo = mid + 1;
      else if (cmp > 0) hi = mid - 1;
      else return mid;
    }
    return ~lo;
  }

  set(key: K, value: V): this {
    const idx = this.binarySearch(key);
    if (idx >= 0) {
      this._values[idx] = value;
    } else {
      const pos = ~idx;
      this._keys.splice(pos, 0, key);
      this._values.splice(pos, 0, value);
    }
    return this;
  }

  get(key: K): V | undefined {
    const idx = this.binarySearch(key);
    if (idx >= 0) return this._values[idx];
    return undefined;
  }

  has(key: K): boolean {
    return this.binarySearch(key) >= 0;
  }

  delete(key: K): boolean {
    const idx = this.binarySearch(key);
    if (idx >= 0) {
      this._keys.splice(idx, 1);
      this._values.splice(idx, 1);
      return true;
    }
    return false;
  }

  get size(): number {
    return this._keys.length;
  }

  isEmpty(): boolean {
    return this._keys.length === 0;
  }

  clear(): void {
    this._keys.length = 0;
    this._values.length = 0;
  }

  min(): K | undefined {
    return this._keys.length > 0 ? this._keys[0] : undefined;
  }

  max(): K | undefined {
    return this._keys.length > 0 ? this._keys[this._keys.length - 1] : undefined;
  }

  floor(key: K): K | undefined {
    const idx = this.binarySearch(key);
    if (idx >= 0) return this._keys[idx];
    const pos = ~idx;
    if (pos === 0) return undefined;
    return this._keys[pos - 1];
  }

  ceiling(key: K): K | undefined {
    const idx = this.binarySearch(key);
    if (idx >= 0) return this._keys[idx];
    const pos = ~idx;
    if (pos >= this._keys.length) return undefined;
    return this._keys[pos];
  }

  lower(key: K): K | undefined {
    const idx = this.binarySearch(key);
    let pos: number;
    if (idx >= 0) {
      pos = idx;
    } else {
      pos = ~idx;
    }
    if (pos === 0) return undefined;
    return this._keys[pos - 1];
  }

  higher(key: K): K | undefined {
    const idx = this.binarySearch(key);
    let pos: number;
    if (idx >= 0) {
      pos = idx + 1;
    } else {
      pos = ~idx;
    }
    if (pos >= this._keys.length) return undefined;
    return this._keys[pos];
  }

  range(lo: K, hi: K): Entry<K, V>[] {
    const result: Entry<K, V>[] = [];
    const startIdx = this.binarySearch(lo);
    const startPos = startIdx >= 0 ? startIdx : ~startIdx;
    for (let i = startPos; i < this._keys.length; i++) {
      if (this.compare(this._keys[i]!, hi) > 0) break;
      result.push({ key: this._keys[i]!, value: this._values[i]! });
    }
    return result;
  }

  indexOf(key: K): number {
    const idx = this.binarySearch(key);
    return idx >= 0 ? idx : -1;
  }

  keys(): K[] {
    return [...this._keys];
  }

  values(): V[] {
    return [...this._values];
  }

  entries(): Entry<K, V>[] {
    const result: Entry<K, V>[] = [];
    for (let i = 0; i < this._keys.length; i++) {
      result.push({ key: this._keys[i]!, value: this._values[i]! });
    }
    return result;
  }

  toArray(): Entry<K, V>[] {
    return this.entries();
  }

  forEach(callback: (value: V, key: K, map: SortedArrayMap<K, V>) => void): void {
    for (let i = 0; i < this._keys.length; i++) {
      callback(this._values[i]!, this._keys[i]!, this);
    }
  }

  [Symbol.iterator](): Iterator<Entry<K, V>> {
    let index = 0;
    const keys = this._keys;
    const values = this._values;
    const len = keys.length;
    return {
      next(): IteratorResult<Entry<K, V>> {
        if (index < len) {
          const result: Entry<K, V> = { key: keys[index]!, value: values[index]! };
          index++;
          return { value: result, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }

  toString(): string {
    return `SortedArrayMap({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SortedArrayMap', size: this.size, items: this.toArray() }
  }
}
