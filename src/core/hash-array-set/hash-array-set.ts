import type { HashArraySetOptions } from "./types.js";

export class HashArraySet<T> implements Iterable<T> {
  private buckets: (T[] | undefined)[];
  private _size = 0;
  private _capacity: number;
  private _loadFactor: number;

  constructor(options?: HashArraySetOptions);
  constructor(capacity?: number, loadFactor?: number);
  constructor(capacityOrOptions?: number | HashArraySetOptions, loadFactor?: number) {
    if (typeof capacityOrOptions === "object" && capacityOrOptions !== null) {
      this._capacity = capacityOrOptions.capacity ?? 16;
      this._loadFactor = capacityOrOptions.loadFactor ?? 0.75;
    } else {
      this._capacity = (capacityOrOptions as number | undefined) ?? 16;
      this._loadFactor = loadFactor ?? 0.75;
    }
    this.buckets = new Array(this._capacity);
  }

  private hash(item: T): number {
    const str = String(item);
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return ((h >>> 0) % this._capacity);
  }

  private maybeResize(): void {
    if (this._capacity === 0) {
      this.resize(16);
      return;
    }
    if (this._size / this._capacity > this._loadFactor) {
      this.resize(this._capacity * 2);
    }
  }

  add(item: T): this {
    const idx = this.hash(item);
    const bucket = this.buckets[idx];
    if (bucket !== undefined) {
      for (let i = 0; i < bucket.length; i++) {
        if (bucket[i] === item) {
          return this;
        }
      }
      bucket.push(item);
    } else {
      this.buckets[idx] = [item];
    }
    this._size++;
    this.maybeResize();
    return this;
  }

  delete(item: T): boolean {
    const idx = this.hash(item);
    const bucket = this.buckets[idx];
    if (bucket === undefined) {
      return false;
    }
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i] === item) {
        bucket.splice(i, 1);
        if (bucket.length === 0) {
          this.buckets[idx] = undefined;
        }
        this._size--;
        return true;
      }
    }
    return false;
  }

  has(item: T): boolean {
    const idx = this.hash(item);
    const bucket = this.buckets[idx];
    if (bucket === undefined) {
      return false;
    }
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i] === item) {
        return true;
      }
    }
    return false;
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.buckets = new Array(this._capacity);
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.buckets.length; i++) {
      const bucket = this.buckets[i];
      if (bucket !== undefined) {
        for (let j = 0; j < bucket.length; j++) {
          result.push(bucket[j]!);
        }
      }
    }
    return result;
  }

  forEach(callback: (item: T, index: number) => void): void {
    let idx = 0;
    for (let i = 0; i < this.buckets.length; i++) {
      const bucket = this.buckets[i];
      if (bucket !== undefined) {
        for (let j = 0; j < bucket.length; j++) {
          callback(bucket[j]!, idx++);
        }
      }
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.buckets.length; i++) {
      const bucket = this.buckets[i];
      if (bucket !== undefined) {
        for (let j = 0; j < bucket.length; j++) {
          yield bucket[j]!;
        }
      }
    }
  }

  addMany(items: Iterable<T>): this {
    for (const item of items) {
      this.add(item);
    }
    return this;
  }

  deleteMany(items: Iterable<T>): boolean {
    let changed = false;
    for (const item of items) {
      if (this.delete(item)) {
        changed = true;
      }
    }
    return changed;
  }

  union(other: HashArraySet<T>): HashArraySet<T> {
    const result = new HashArraySet<T>({ capacity: this._capacity, loadFactor: this._loadFactor });
    for (const item of this) {
      result.add(item);
    }
    for (const item of other) {
      result.add(item);
    }
    return result;
  }

  intersection(other: HashArraySet<T>): HashArraySet<T> {
    const result = new HashArraySet<T>({ capacity: this._capacity, loadFactor: this._loadFactor });
    for (const item of this) {
      if (other.has(item)) {
        result.add(item);
      }
    }
    return result;
  }

  difference(other: HashArraySet<T>): HashArraySet<T> {
    const result = new HashArraySet<T>({ capacity: this._capacity, loadFactor: this._loadFactor });
    for (const item of this) {
      if (!other.has(item)) {
        result.add(item);
      }
    }
    return result;
  }

  isSubsetOf(other: HashArraySet<T>): boolean {
    for (const item of this) {
      if (!other.has(item)) {
        return false;
      }
    }
    return true;
  }

  isSupersetOf(other: HashArraySet<T>): boolean {
    return other.isSubsetOf(this);
  }

  equals(other: HashArraySet<T>): boolean {
    if (this._size !== other.size) {
      return false;
    }
    for (const item of this) {
      if (!other.has(item)) {
        return false;
      }
    }
    return true;
  }

  map<U>(fn: (item: T) => U): HashArraySet<U> {
    const result = new HashArraySet<U>({ capacity: this._capacity, loadFactor: this._loadFactor });
    for (const item of this) {
      result.add(fn(item));
    }
    return result;
  }

  filter(fn: (item: T) => boolean): HashArraySet<T> {
    const result = new HashArraySet<T>({ capacity: this._capacity, loadFactor: this._loadFactor });
    for (const item of this) {
      if (fn(item)) {
        result.add(item);
      }
    }
    return result;
  }

  get capacity(): number {
    return this._capacity;
  }

  get loadFactorValue(): number {
    return this._loadFactor;
  }

  get bucketCount(): number {
    let count = 0;
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.buckets[i] !== undefined) {
        count++;
      }
    }
    return count;
  }

  resize(newCapacity: number): void {
    const oldBuckets = this.buckets;
    this._capacity = newCapacity;
    this.buckets = new Array(newCapacity);
    this._size = 0;
    for (let i = 0; i < oldBuckets.length; i++) {
      const bucket = oldBuckets[i];
      if (bucket !== undefined) {
        for (let j = 0; j < bucket.length; j++) {
          this.add(bucket[j]!);
        }
      }
    }
  }
}
