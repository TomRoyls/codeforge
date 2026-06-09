interface Entry<K, V> {
  key: K;
  value: V;
  deleted: boolean;
}

export class HashTable4<K, V> {
  private table: (Entry<K, V> | null)[];
  private _size: number;

  constructor(initialCapacity: number = 16) {
    this.table = new Array(Math.max(1, this.nextPowerOfTwo(initialCapacity))).fill(null);
    this._size = 0;
  }

  set(key: K, value: V): void {
    let index = this.hash(key);
    let firstDeletedIndex = -1;
    let i = 0;
    const startIndex = index;

    while (this.table[index] !== null) {
      const entry = this.table[index]!;
      if (!entry.deleted && entry.key === key) {
        entry.value = value;
        return;
      }
      if (entry.deleted && firstDeletedIndex === -1) {
        firstDeletedIndex = index;
      }
      i++;
      index = this.probe(startIndex, i);
      if (index === startIndex) break;
    }

    if ((this._size + 1) / this.capacity > 0.7) {
      this.resize(this.capacity * 2);
      index = this.hash(key);
      firstDeletedIndex = -1;
      i = 0;
      const newStartIndex = index;
      while (this.table[index] !== null) {
        const entry = this.table[index]!;
        if (!entry.deleted && entry.key === key) {
          entry.value = value;
          return;
        }
        if (entry.deleted && firstDeletedIndex === -1) {
          firstDeletedIndex = index;
        }
        i++;
        index = this.probe(newStartIndex, i);
      }
    }

    if (firstDeletedIndex !== -1) {
      index = firstDeletedIndex;
    }

    this.table[index] = { key, value, deleted: false };
    this._size++;
  }

  get(key: K): V | undefined {
    let index = this.hash(key);
    let i = 0;
    const startIndex = index;

    while (this.table[index] !== null) {
      const entry = this.table[index]!;
      if (!entry.deleted && entry.key === key) {
        return entry.value;
      }
      i++;
      index = this.probe(startIndex, i);
      if (index === startIndex) break;
    }

    return undefined;
  }

  delete(key: K): boolean {
    let index = this.hash(key);
    let i = 0;
    const startIndex = index;

    while (this.table[index] !== null) {
      const entry = this.table[index]!;
      if (!entry.deleted && entry.key === key) {
        entry.deleted = true;
        this._size--;
        return true;
      }
      i++;
      index = this.probe(startIndex, i);
      if (index === startIndex) break;
    }

    return false;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.table.fill(null);
    this._size = 0;
  }

  getTimeComplexity(): string {
    return 'Average: O(1), Worst: O(n)';
  }

  keys(): K[] {
    const result: K[] = [];
    for (const entry of this.table) {
      if (entry !== null && !entry.deleted) {
        result.push(entry.key);
      }
    }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    for (const entry of this.table) {
      if (entry !== null && !entry.deleted) {
        result.push(entry.value);
      }
    }
    return result;
  }

  entries(): [K, V][] {
    const result: [K, V][] = [];
    for (const entry of this.table) {
      if (entry !== null && !entry.deleted) {
        result.push([entry.key, entry.value]);
      }
    }
    return result;
  }

  forEach(callback: (value: V, key: K) => void): void {
    for (const entry of this.table) {
      if (entry !== null && !entry.deleted) {
        callback(entry.value, entry.key);
      }
    }
  }

  resize(newCapacity: number): void {
    const oldTable = this.table;
    const oldSize = this._size;
    this.table = new Array(Math.max(1, this.nextPowerOfTwo(newCapacity))).fill(null);
    this._size = 0;

    for (const entry of oldTable) {
      if (entry !== null && !entry.deleted) {
        this.set(entry.key, entry.value);
      }
    }

    this._size = oldSize;
  }

  get loadFactor(): number {
    return this._size / this.capacity;
  }

  get capacity(): number {
    return this.table.length;
  }

  private hash(key: K): number {
    let hash: number;
    if (typeof key === 'string') {
      hash = this.stringHash(key);
    } else if (typeof key === 'number') {
      hash = this.numberHash(key);
    } else {
      hash = this.objectHash(key);
    }
    return (hash >>> 0) % this.capacity;
  }

  private probe(startIndex: number, attempt: number): number {
    return (startIndex + (attempt * (attempt + 1)) / 2) % this.capacity;
  }

  private stringHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return hash;
  }

  private numberHash(num: number): number {
    if (!Number.isFinite(num)) return 0;
    const int = Math.floor(num);
    return int ^ (int >>> 16);
  }

  private objectHash(obj: unknown): number {
    const str = String(obj);
    return this.stringHash(str);
  }

  private nextPowerOfTwo(n: number): number {
    if (n <= 1) return 2;
    let power = 1;
    while (power < n) {
      power *= 2;
    }
    return power;
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

  toArray() {
    return this.entries()
  }
}
