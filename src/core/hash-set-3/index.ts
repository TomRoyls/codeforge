export type HashEntry<T> = {
  hash: number;
  value: T;
  distance: number;
};

export class HashSet3<T> {
  private entries: (HashEntry<T> | undefined)[];
  private _size: number;
  private capacity: number;
  private readonly loadFactor: number;

  constructor(initialCapacity: number = 16) {
    this.capacity = Math.max(2, this.nextPowerOfTwo(initialCapacity));
    this.entries = new Array(this.capacity);
    this._size = 0;
    this.loadFactor = 0.75;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.entries.fill(undefined);
    this._size = 0;
  }

  private hash(value: T): number {
    const str = String(value);
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0;
  }

  private getIndex(hash: number): number {
    return hash & (this.capacity - 1);
  }

  private nextPowerOfTwo(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }

  private resize(): void {
    const oldEntries = this.entries;
    this.capacity = this.nextPowerOfTwo(Math.floor(this.capacity * 2));
    this.entries = new Array(this.capacity);
    this._size = 0;

    for (const entry of oldEntries) {
      if (entry !== undefined) {
        this.insertEntry(entry);
      }
    }
  }

  private insertEntry(entry: HashEntry<T>): void {
    let index = this.getIndex(entry.hash);
    let distance = 0;

    while (true) {
      const current = this.entries[index];

      if (current === undefined) {
        this.entries[index] = { ...entry, distance };
        this._size++;
        return;
      }

      if (current.hash === entry.hash && current.value === entry.value) {
        return;
      }

      if (current.distance < distance) {
        [this.entries[index], entry] = [entry, current];
        distance = entry.distance;
      }

      index = (index + 1) & (this.capacity - 1);
      distance++;
    }
  }

  add(value: T): boolean {
    const hash = this.hash(value);
    const entry: HashEntry<T> = { hash, value, distance: 0 };

    if (this._size >= this.capacity * this.loadFactor) {
      this.resize();
    }

    const oldSize = this._size;
    this.insertEntry(entry);
    return this._size > oldSize;
  }

  has(value: T): boolean {
    const hash = this.hash(value);
    let index = this.getIndex(hash);
    let distance = 0;

    while (distance < this.capacity) {
      const current = this.entries[index];

      if (current === undefined) {
        return false;
      }

      if (current.distance < distance) {
        return false;
      }

      if (current.hash === hash && current.value === value) {
        return true;
      }

      index = (index + 1) & (this.capacity - 1);
      distance++;
    }

    return false;
  }

  delete(value: T): boolean {
    const hash = this.hash(value);
    let index = this.getIndex(hash);
    let distance = 0;

    while (distance < this.capacity) {
      const current = this.entries[index];

      if (current === undefined) {
        return false;
      }

      if (current.distance < distance) {
        return false;
      }

      if (current.hash === hash && current.value === value) {
        this.entries[index] = undefined;
        this._size--;
        this.backshift(index);
        return true;
      }

      index = (index + 1) & (this.capacity - 1);
      distance++;
    }

    return false;
  }

  private backshift(index: number): void {
    let nextIndex = (index + 1) & (this.capacity - 1);

    while (this.entries[nextIndex] !== undefined && this.entries[nextIndex]!.distance > 0) {
      const entry = this.entries[nextIndex]!;
      entry.distance--;
      this.entries[index] = entry;
      this.entries[nextIndex] = undefined;
      index = nextIndex;
      nextIndex = (index + 1) & (this.capacity - 1);
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    for (const entry of this.entries) {
      if (entry !== undefined) {
        result.push(entry.value);
      }
    }
    return result;
  }

  forEach(callback: (value: T, set: HashSet3<T>) => void): void {
    for (const entry of this.entries) {
      if (entry !== undefined) {
        callback(entry.value, this);
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (const entry of this.entries) {
      if (entry !== undefined) {
        yield entry.value;
      }
    }
  }

  union(other: HashSet3<T>): HashSet3<T> {
    const result = new HashSet3<T>(this.capacity + other.capacity);
    for (const value of this) {
      result.add(value);
    }
    for (const value of other) {
      result.add(value);
    }
    return result;
  }

  intersection(other: HashSet3<T>): HashSet3<T> {
    const result = new HashSet3<T>();
    for (const value of this) {
      if (other.has(value)) {
        result.add(value);
      }
    }
    return result;
  }

  difference(other: HashSet3<T>): HashSet3<T> {
    const result = new HashSet3<T>();
    for (const value of this) {
      if (!other.has(value)) {
        result.add(value);
      }
    }
    return result;
  }

  isSubsetOf(other: HashSet3<T>): boolean {
    if (this._size > other._size) {
      return false;
    }
    for (const value of this) {
      if (!other.has(value)) {
        return false;
      }
    }
    return true;
  }

  toString(): string {
    return `${HashSet3}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'HashSet3', size: this.size, items: this.toArray() }
  }


  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }


  count(predicate: (item: T) => boolean): number {
    return this.toArray().filter(predicate).length
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  unique(): T[] {
    return [...new Set(this.toArray())]
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  min(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }
}
