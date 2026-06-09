type Entry<K, V> = [K, V] | null | undefined;

const TOMBSTONE = Symbol('tombstone');

export class HashMap5<K, V> {
  private _entries: (Entry<K, V> | typeof TOMBSTONE)[];
  private capacity: number;
  private loadFactor: number;
  private _size: number;

  constructor(initialCapacity: number = 16, loadFactor: number = 0.75) {
    if (initialCapacity < 1) {
      throw new RangeError(`Initial capacity must be >= 1, got ${initialCapacity}`);
    }
    this.capacity = initialCapacity;
    this.loadFactor = loadFactor;
    this._size = 0;
    this._entries = new Array(this.capacity);
  }

  private hash(key: K): number {
    const strKey = String(key);
    let hash = 0;
    for (let i = 0; i < strKey.length; i++) {
      const char = strKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return (hash >>> 0) % this.capacity;
  }

  private findSlot(key: K): { index: number; found: boolean } {
    const startIndex = this.hash(key);
    let index = startIndex;
    let firstTombstone = -1;

    while (this._entries[index] !== undefined) {
      const entry = this._entries[index];
      if (entry === null || entry === undefined) {
        if (firstTombstone === -1) {
          firstTombstone = index;
        }
        break;
      }
      if (entry !== TOMBSTONE && entry[0] === key) {
        return { index, found: true };
      }
      index = (index + 1) % this.capacity;
      if (index === startIndex) {
        break;
      }
    }

    return { index: firstTombstone !== -1 ? firstTombstone : index, found: false };
  }

  set(key: K, value: V): void {
    const { index, found } = this.findSlot(key);
    this._entries[index] = [key, value];
    if (!found) {
      this._size++;
      if (this._size > this.capacity * this.loadFactor) {
        this.resize(this.capacity * 2);
      }
    }
  }

  get(key: K): V | undefined {
    const { index, found } = this.findSlot(key);
    const entry = this._entries[index];
    if (found && entry !== TOMBSTONE && entry !== null && entry !== undefined) {
      return entry[1];
    }
    return undefined;
  }

  delete(key: K): boolean {
    const { index, found } = this.findSlot(key);
    if (found) {
      this._entries[index] = TOMBSTONE;
      this._size--;
      return true;
    }
    return false;
  }

  has(key: K): boolean {
    const { index, found } = this.findSlot(key);
    return found && this._entries[index] !== TOMBSTONE;
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this._entries = new Array(this.capacity);
    this._size = 0;
  }

  getTimeComplexity(): string {
    return "O(1) average case, O(n) worst case";
  }

  keys(): K[] {
    const result: K[] = [];
    for (let i = 0; i < this.capacity; i++) {
      const entry = this._entries[i];
      if (entry !== null && entry !== undefined && entry !== TOMBSTONE) {
        result.push(entry[0]);
      }
    }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    for (let i = 0; i < this.capacity; i++) {
      const entry = this._entries[i];
      if (entry !== null && entry !== undefined && entry !== TOMBSTONE) {
        result.push(entry[1]);
      }
    }
    return result;
  }

  entries(): [K, V][] {
    const result: [K, V][] = [];
    for (let i = 0; i < this.capacity; i++) {
      const entry = this._entries[i];
      if (entry !== null && entry !== undefined && entry !== TOMBSTONE) {
        result.push(entry);
      }
    }
    return result;
  }

  forEach(callback: (value: V, key: K) => void): void {
    for (let i = 0; i < this.capacity; i++) {
      const entry = this._entries[i];
      if (entry !== null && entry !== undefined && entry !== TOMBSTONE) {
        callback(entry[1], entry[0]);
      }
    }
  }

  filter(predicate: (value: V, key: K) => boolean): HashMap5<K, V> {
    const result = new HashMap5<K, V>(this.capacity, this.loadFactor);
    for (let i = 0; i < this.capacity; i++) {
      const entry = this._entries[i];
      if (entry !== null && entry !== undefined && entry !== TOMBSTONE) {
        if (predicate(entry[1], entry[0])) {
          result.set(entry[0], entry[1]);
        }
      }
    }
    return result;
  }

  map<R>(mapper: (value: V, key: K) => R): HashMap5<K, R> {
    const result = new HashMap5<K, R>(this.capacity, this.loadFactor);
    for (let i = 0; i < this.capacity; i++) {
      const entry = this._entries[i];
      if (entry !== null && entry !== undefined && entry !== TOMBSTONE) {
        result.set(entry[0], mapper(entry[1], entry[0]));
      }
    }
    return result;
  }

  reduce<R>(reducer: (accumulator: R, value: V, key: K) => R, initialValue: R): R {
    let accumulator = initialValue;
    for (let i = 0; i < this.capacity; i++) {
      const entry = this._entries[i];
      if (entry !== null && entry !== undefined && entry !== TOMBSTONE) {
        accumulator = reducer(accumulator, entry[1], entry[0]);
      }
    }
    return accumulator;
  }

  merge(other: HashMap5<K, V>): void {
    other.forEach((value, key) => {
      this.set(key, value);
    });
  }

  bulkSet(entries: [K, V][]): void {
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }

  private resize(newCapacity: number): void {
    const oldEntries = this._entries;
    this.capacity = newCapacity;
    this._size = 0;
    this._entries = new Array(this.capacity);

    for (const entry of oldEntries) {
      if (entry !== null && entry !== undefined && entry !== TOMBSTONE) {
        this.set(entry[0], entry[1]);
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

  toArray() {
    return this.entries()
  }

  toString(): string {
    return `${HashMap5}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'HashMap5', size: this.size, items: this.toArray() }
  }

}
