import {
  DEFAULT_MULTI_MAP_OPTIONS,
  type MultiMapOptions,
  type MultiMapStatistics,
} from "./types.js";

export class MultiMap<K, V> {
  private map = new Map<K, V[]>();
  private options: MultiMapOptions;
  private stats: MultiMapStatistics = {
    keysAdded: 0,
    keysRemoved: 0,
    valuesAdded: 0,
    valuesRemoved: 0,
  };

  constructor(options?: MultiMapOptions) {
    this.options = { ...DEFAULT_MULTI_MAP_OPTIONS, ...options };
  }

  set(key: K, value: V): this {
    const existing = this.map.get(key);
    if (existing === undefined) {
      this.map.set(key, [value]);
      this.stats.keysAdded++;
      this.stats.valuesAdded++;
    } else {
      if (
        this.options.allowDuplicateValues ||
        !existing.includes(value)
      ) {
        existing.push(value);
        this.stats.valuesAdded++;
      }
    }
    return this;
  }

  get(key: K): V[] | undefined {
    const values = this.map.get(key);
    if (values === undefined) {
      return undefined;
    }
    return [...values];
  }

  delete(key: K): boolean {
    const values = this.map.get(key);
    if (values === undefined) {
      return false;
    }
    this.stats.keysRemoved++;
    this.stats.valuesRemoved += values.length;
    return this.map.delete(key);
  }

  deleteValue(key: K, value: V): boolean {
    const values = this.map.get(key);
    if (values === undefined) {
      return false;
    }
    const index = values.indexOf(value);
    if (index === -1) {
      return false;
    }
    values.splice(index, 1);
    this.stats.valuesRemoved++;
    if (values.length === 0) {
      this.map.delete(key);
      this.stats.keysRemoved++;
    }
    return true;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  hasValue(key: K, value: V): boolean {
    const values = this.map.get(key);
    if (values === undefined) {
      return false;
    }
    return values.includes(value);
  }

  get size(): number {
    return this.map.size;
  }

  get valueCount(): number {
    let count = 0;
    for (const values of this.map.values()) {
      count += values.length;
    }
    return count;
  }

  isEmpty(): boolean {
    return this.map.size === 0;
  }

  clear(): void {
    for (const values of this.map.values()) {
      this.stats.valuesRemoved += values.length;
    }
    this.stats.keysRemoved += this.map.size;
    this.map.clear();
  }

  keys(): IterableIterator<K> {
    return this.map.keys();
  }

  values(): V[] {
    const result: V[] = [];
    for (const vals of this.map.values()) {
      result.push(...vals);
    }
    return result;
  }

  entries(): IterableIterator<[K, V[]]> {
    const entries: [K, V[]][] = [];
    for (const [key, vals] of this.map.entries()) {
      entries.push([key, [...vals]]);
    }
    return entries[Symbol.iterator]();
  }

  forEach(callback: (key: K, values: V[], map: MultiMap<K, V>) => void): void {
    for (const [key, values] of this.map.entries()) {
      callback(key, [...values], this);
    }
  }

  *[Symbol.iterator](): IterableIterator<[K, V]> {
    for (const [key, values] of this.map.entries()) {
      for (const value of values) {
        yield [key, value];
      }
    }
  }

  count(key: K): number {
    const values = this.map.get(key);
    if (values === undefined) {
      return 0;
    }
    return values.length;
  }

  replace(key: K, values: V[]): this {
    const existing = this.map.get(key);
    if (existing !== undefined) {
      this.stats.valuesRemoved += existing.length;
    } else {
      this.stats.keysAdded++;
    }
    this.map.set(key, [...values]);
    this.stats.valuesAdded += values.length;
    return this;
  }

  merge(other: MultiMap<K, V>): this {
    for (const [key, value] of other) {
      this.set(key, value);
    }
    return this;
  }

  clone(): MultiMap<K, V> {
    const result = new MultiMap<K, V>({ ...this.options });
    for (const [key, values] of this.map.entries()) {
      result.map.set(key, [...values]);
    }
    result.stats = { ...this.stats };
    return result;
  }

  getStatistics(): MultiMapStatistics {
    return { ...this.stats };
  }
}
