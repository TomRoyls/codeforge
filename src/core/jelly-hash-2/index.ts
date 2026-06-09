type Entry<K, V> = { key: K; value: V; next: Entry<K, V> | null };

export class JellyHash2<K, V> {
  private buckets: Array<Entry<K, V> | null>;
  private _size: number;
  private _loadFactor: number;
  private hashFn: (key: K) => number;

  constructor(options?: { initialCapacity?: number; loadFactor?: number; hashFn?: (key: K) => number }) {
    const { initialCapacity = 16, loadFactor = 0.75, hashFn } = options ?? {};

    this.buckets = new Array<Entry<K, V> | null>(initialCapacity).fill(null);
    this._size = 0;
    this._loadFactor = loadFactor;
    this.hashFn = hashFn ?? this.defaultHashFn;
  }

  private defaultHashFn(key: K): number {
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return (hash >>> 0);
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  get capacity(): number {
    return this.buckets.length;
  }

  loadFactor(): number {
    return this._size / this.buckets.length;
  }

  private getIndex(key: K): number {
    const hash = this.hashFn(key);
    return ((hash % this.buckets.length) + this.buckets.length) % this.buckets.length;
  }

  set(key: K, value: V): void {
    const index = this.getIndex(key);
    let entry: Entry<K, V> | null = this.buckets[index] ?? null;

    while (entry != null) {
      if (entry.key === key) {
        entry.value = value;
        return;
      }
      entry = entry.next;
    }

    const newEntry: Entry<K, V> = { key, value, next: this.buckets[index] ?? null };
    this.buckets[index] = newEntry;
    this._size++;

    if (this.loadFactor() > this._loadFactor) {
      this.resize();
    }
  }

  get(key: K): V | undefined {
    const index = this.getIndex(key);
    let entry: Entry<K, V> | null = this.buckets[index] ?? null;

    while (entry != null) {
      if (entry.key === key) {
        return entry.value;
      }
      entry = entry.next;
    }

    return undefined;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    const index = this.getIndex(key);
    let entry: Entry<K, V> | null = this.buckets[index] ?? null;
    let prev: Entry<K, V> | null = null;

    while (entry != null) {
      if (entry.key === key) {
        if (prev === null) {
          this.buckets[index] = entry.next;
        } else {
          prev.next = entry.next;
        }
        this._size--;
        return true;
      }
      prev = entry;
      entry = entry.next;
    }

    return false;
  }

  clear(): void {
    this.buckets.fill(null);
    this._size = 0;
  }

  keys(): K[] {
    const result: K[] = [];

    for (let i = 0; i < this.buckets.length; i++) {
      let entry: Entry<K, V> | null = this.buckets[i] ?? null;
      while (entry != null) {
        result.push(entry.key);
        entry = entry.next;
      }
    }

    return result;
  }

  values(): V[] {
    const result: V[] = [];

    for (let i = 0; i < this.buckets.length; i++) {
      let entry: Entry<K, V> | null = this.buckets[i] ?? null;
      while (entry != null) {
        result.push(entry.value);
        entry = entry.next;
      }
    }

    return result;
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = [];

    for (let i = 0; i < this.buckets.length; i++) {
      let entry: Entry<K, V> | null = this.buckets[i] ?? null;
      while (entry != null) {
        result.push([entry.key, entry.value]);
        entry = entry.next;
      }
    }

    return result;
  }

  private resize(): void {
    const oldBuckets = this.buckets;
    const newCapacity = oldBuckets.length * 2;
    this.buckets = new Array<Entry<K, V> | null>(newCapacity).fill(null);
    this._size = 0;

    for (let i = 0; i < oldBuckets.length; i++) {
      let entry: Entry<K, V> | null = oldBuckets[i] ?? null;
      while (entry != null) {
        this.set(entry.key, entry.value);
        entry = entry.next;
      }
    }
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const items = this.entries();
    let index = 0;
    return {
      next(): IteratorResult<[K, V]> {
        if (index < items.length) {
          return { value: items[index++]!, done: false };
        }
        return { value: undefined as unknown as [K, V], done: true };
      },
    };
  }

  forEach(callback: (entry: [K,  V], index: number) => void): void {
    const items = this.entries()
    for (let i = 0; i < items.length; i++) {
      callback(items[i]!, i)
    }
  }

  toString(): string {
    return `${JellyHash2}({ size: ${this.size} })`
  }

  toArray(): any[] {
    return [...this]
  }

  toJSON() {
    return { type: 'JellyHash2', size: this.size, items: this.toArray() }
  }
}
