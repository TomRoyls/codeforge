export class CollisionMap2<T> {
  private buckets: [string, T][][];
  private _size: number;
  private _collisionCount: number;
  private _maxChainLength: number;

  constructor(bucketCount: number = 16) {
    this.buckets = Array.from({ length: bucketCount }, () => []);
    this._size = 0;
    this._collisionCount = 0;
    this._maxChainLength = 0;
  }

  private hash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
      hash = hash & hash;
    }
    return (hash >>> 0) % this.buckets.length;
  }

  set(key: string, value: T): void {
    const index = this.hash(key);
    const bucket = this.buckets[index]!;

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i]![0] === key) {
        bucket[i]![1] = value;
        return;
      }
    }

    bucket.push([key, value]);
    this._size++;

    if (bucket.length > 1) {
      this._collisionCount++;
    }

    this._maxChainLength = Math.max(this._maxChainLength, bucket.length);
  }

  get(key: string): T | undefined {
    const index = this.hash(key);
    const bucket = this.buckets[index]!;

    for (const [k, v] of bucket) {
      if (k === key) {
        return v;
      }
    }

    return undefined;
  }

  has(key: string): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index]!;

    for (const [k] of bucket) {
      if (k === key) {
        return true;
      }
    }

    return false;
  }

  delete(key: string): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index]!;

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i]![0] === key) {
        bucket.splice(i, 1);
        this._size--;
        this.recalculateMaxChainLength();
        return true;
      }
    }

    return false;
  }

  private recalculateMaxChainLength(): void {
    let max = 0;
    for (const bucket of this.buckets) {
      max = Math.max(max, bucket.length);
    }
    this._maxChainLength = max;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    for (let i = 0; i < this.buckets.length; i++) {
      this.buckets[i] = [];
    }
    this._size = 0;
    this._collisionCount = 0;
    this._maxChainLength = 0;
  }

  keys(): string[] {
    const result: string[] = [];
    for (const bucket of this.buckets) {
      for (const [key] of bucket) {
        result.push(key);
      }
    }
    return result;
  }

  values(): T[] {
    const result: T[] = [];
    for (const bucket of this.buckets) {
      for (const [, value] of bucket) {
        result.push(value);
      }
    }
    return result;
  }

  entries(): [string, T][] {
    const result: [string, T][] = [];
    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        result.push(entry);
      }
    }
    return result;
  }

  collisionCount(): number {
    return this._collisionCount;
  }

  maxChainLength(): number {
    return this._maxChainLength;
  }

  bucketUtilization(): number {
    let usedBuckets = 0;
    for (const bucket of this.buckets) {
      if (bucket.length > 0) {
        usedBuckets++;
      }
    }
    return usedBuckets / this.buckets.length;
  }

  rehash(newBucketCount: number): void {
    const oldBuckets = this.buckets;
    this.buckets = Array.from({ length: newBucketCount }, () => []);
    this._size = 0;
    this._collisionCount = 0;
    this._maxChainLength = 0;

    for (const bucket of oldBuckets) {
      for (const [key, value] of bucket) {
        this.set(key, value);
      }
    }
  }
  *[Symbol.iterator]() {
    yield* this.entries()
  }

  toArray() {
    return this.entries()
  }

  forEach(callback: (entry: [string, T], index: number) => void): void {
    const items = this.entries()
    for (let i = 0; i < items.length; i++) {
      callback(items[i]!, i)
    }
  }

  toString(): string {
    return `${CollisionMap2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'CollisionMap2', size: this.size, items: this.toArray() }
  }



  get [Symbol.toStringTag](): string {
    return 'CollisionMap2'
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
