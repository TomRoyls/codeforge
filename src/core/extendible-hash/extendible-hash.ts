import type { ExtendibleHashOptions, ExtendibleHashStatistics, BucketEntry } from "./types.js";
import { DEFAULT_EXTENDIBLE_HASH_OPTIONS } from "./types.js";

interface Bucket<K, V> {
  localDepth: number;
  entries: Array<BucketEntry<K, V>>;
}

export class ExtendibleHash<K, V> {
  private globalDepth: number;
  private bucketCapacity: number;
  private directory: Array<Bucket<K, V>>;
  private _size: number;
  private _splits: number;
  private _directoryDoublings: number;

  constructor(options?: ExtendibleHashOptions) {
    const opts = { ...DEFAULT_EXTENDIBLE_HASH_OPTIONS, ...options };
    this.globalDepth = opts.initialDepth;
    this.bucketCapacity = opts.bucketCapacity;
    this._size = 0;
    this._splits = 0;
    this._directoryDoublings = 0;
    this.directory = [];
    const dirSize = 1 << this.globalDepth;
    for (let i = 0; i < dirSize; i++) {
      this.directory.push(this.createBucket(this.globalDepth));
    }
  }

  private createBucket(depth: number): Bucket<K, V> {
    return { localDepth: depth, entries: [] };
  }

  private hash(key: K): number {
    const str = String(key);
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    const mask = (1 << this.globalDepth) - 1;
    return h & mask;
  }

  private bucketIndex(key: K, depth: number): number {
    const str = String(key);
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    const mask = (1 << depth) - 1;
    return h & mask;
  }

  set(key: K, value: V): void {
    const idx = this.hash(key);
    const bucket = this.directory[idx]!;
    const existingIndex = bucket.entries.findIndex((e) => e.key === key);
    if (existingIndex !== -1) {
      bucket.entries[existingIndex]!.value = value;
      return;
    }

    if (bucket.entries.length < this.bucketCapacity) {
      bucket.entries.push({ key, value });
      this._size++;
      return;
    }

    this.splitBucket(idx);
    this.set(key, value);
  }

  private splitBucket(idx: number): void {
    const bucket = this.directory[idx]!;

    if (bucket.localDepth === this.globalDepth) {
      this.doubleDirectory();
    }

    const newDepth = bucket.localDepth + 1;
    const newBucket = this.createBucket(newDepth);
    bucket.localDepth = newDepth;

    const oldEntries = bucket.entries;
    bucket.entries = [];

    const highBit = 1 << (newDepth - 1);
    for (const entry of oldEntries) {
      const entryIdx = this.bucketIndex(entry.key, newDepth);
      if ((entryIdx & highBit) !== 0) {
        newBucket.entries.push(entry);
      } else {
        bucket.entries.push(entry);
      }
    }

    for (let i = 0; i < this.directory.length; i++) {
      if ((i & (highBit - 1)) === (idx & (highBit - 1))) {
        if ((i & highBit) !== 0) {
          this.directory[i] = newBucket;
        }
      }
    }

    this._splits++;
  }

  private doubleDirectory(): void {
    const oldLength = this.directory.length;
    for (let i = 0; i < oldLength; i++) {
      this.directory.push(this.directory[i]!);
    }
    this.globalDepth++;
    this._directoryDoublings++;
  }

  get(key: K): V | undefined {
    const idx = this.hash(key);
    const bucket = this.directory[idx]!;
    const entry = bucket.entries.find((e) => e.key === key);
    if (entry) {
      return entry.value;
    }
    return undefined;
  }

  delete(key: K): boolean {
    const idx = this.hash(key);
    const bucket = this.directory[idx]!;
    const entryIndex = bucket.entries.findIndex((e) => e.key === key);
    if (entryIndex === -1) {
      return false;
    }
    bucket.entries.splice(entryIndex, 1);
    this._size--;
    return true;
  }

  has(key: K): boolean {
    const idx = this.hash(key);
    const bucket = this.directory[idx]!;
    return bucket.entries.some((e) => e.key === key);
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.globalDepth = 1;
    this._size = 0;
    this._splits = 0;
    this._directoryDoublings = 0;
    this.directory = [];
    const dirSize = 1 << this.globalDepth;
    for (let i = 0; i < dirSize; i++) {
      this.directory.push(this.createBucket(this.globalDepth));
    }
  }

  keys(): Array<K> {
    const result: Array<K> = [];
    const seen = new Set<Bucket<K, V>>();
    for (const bucket of this.directory) {
      if (seen.has(bucket)) continue;
      seen.add(bucket);
      for (const entry of bucket.entries) {
        result.push(entry.key);
      }
    }
    return result;
  }

  values(): Array<V> {
    const result: Array<V> = [];
    const seen = new Set<Bucket<K, V>>();
    for (const bucket of this.directory) {
      if (seen.has(bucket)) continue;
      seen.add(bucket);
      for (const entry of bucket.entries) {
        result.push(entry.value);
      }
    }
    return result;
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = [];
    const seen = new Set<Bucket<K, V>>();
    for (const bucket of this.directory) {
      if (seen.has(bucket)) continue;
      seen.add(bucket);
      for (const entry of bucket.entries) {
        result.push([entry.key, entry.value]);
      }
    }
    return result;
  }

  forEach(callback: (value: V, key: K, hash: ExtendibleHash<K, V>) => void): void {
    const seen = new Set<Bucket<K, V>>();
    for (const bucket of this.directory) {
      if (seen.has(bucket)) continue;
      seen.add(bucket);
      for (const entry of bucket.entries) {
        callback(entry.value, entry.key, this);
      }
    }
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const allEntries = this.entries();
    let index = 0;
    return {
      next(): IteratorResult<[K, V]> {
        if (index < allEntries.length) {
          const entry = allEntries[index]!;
          index++;
          return { value: entry, done: false };
        }
        return { value: undefined as unknown as [K, V], done: true };
      },
    };
  }

  getDirectoryDepth(): number {
    return this.globalDepth;
  }

  getBucketCount(): number {
    const seen = new Set<Bucket<K, V>>();
    for (const bucket of this.directory) {
      seen.add(bucket);
    }
    return seen.size;
  }

  getBucketCapacity(): number {
    return this.bucketCapacity;
  }

  getStatistics(): ExtendibleHashStatistics {
    return {
      splits: this._splits,
      directoryDoublings: this._directoryDoublings,
      totalBuckets: this.getBucketCount(),
      totalEntries: this._size,
    };
  }

  get loadFactor(): number {
    const bucketCount = this.getBucketCount();
    if (bucketCount === 0) return 0;
    return this._size / (bucketCount * this.bucketCapacity);
  }

  reserve(n: number): void {
    if (n <= this._size) return;
    const neededBuckets = Math.ceil(n / this.bucketCapacity);
    const neededDepth = Math.ceil(Math.log2(neededBuckets));
    const targetDepth = Math.max(neededDepth, this.globalDepth);
    while (this.globalDepth < targetDepth) {
      this.doubleDirectory();
    }
  }
}
