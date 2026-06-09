export class HashMap<K, V> {
  private buckets: [K, V][][];
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
    this.buckets = [];
    for (let i = 0; i < this.capacity; i++) {
      this.buckets.push([]);
    }
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

  set(key: K, value: V): void {
    const index = this.hash(key);
    const bucket = this.buckets[index]!;

    for (let i = 0; i < bucket.length; i++) {
      const entry = bucket[i]!;
      if (entry[0] === key) {
        entry[1] = value;
        return;
      }
    }

    bucket.push([key, value]);
    this._size++;

    if (this._size > this.capacity * this.loadFactor) {
      this.resize(this.capacity * 2);
    }
  }

  get(key: K): V | undefined {
    const index = this.hash(key);
    const bucket = this.buckets[index]!;

    for (let i = 0; i < bucket.length; i++) {
      const entry = bucket[i]!;
      if (entry[0] === key) {
        return entry[1];
      }
    }

    return undefined;
  }

  delete(key: K): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index]!;

    for (let i = 0; i < bucket.length; i++) {
      const entry = bucket[i]!;
      if (entry[0] === key) {
        bucket.splice(i, 1);
        this._size--;
        return true;
      }
    }

    return false;
  }

  has(key: K): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index]!;

    for (let i = 0; i < bucket.length; i++) {
      const entry = bucket[i]!;
      if (entry[0] === key) {
        return true;
      }
    }

    return false;
  }

  size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    for (let i = 0; i < this.capacity; i++) {
      this.buckets[i]! = [];
    }
    this._size = 0;
  }

  keys(): K[] {
    const result: K[] = [];
    for (let i = 0; i < this.capacity; i++) {
      const bucket = this.buckets[i]!;
      for (let j = 0; j < bucket.length; j++) {
        result.push(bucket[j]![0]);
      }
    }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    for (let i = 0; i < this.capacity; i++) {
      const bucket = this.buckets[i]!;
      for (let j = 0; j < bucket.length; j++) {
        result.push(bucket[j]![1]);
      }
    }
    return result;
  }

  entries(): [K, V][] {
    const result: [K, V][] = [];
    for (let i = 0; i < this.capacity; i++) {
      const bucket = this.buckets[i]!;
      for (let j = 0; j < bucket.length; j++) {
        result.push(bucket[j]!);
      }
    }
    return result;
  }

  forEach(callback: (value: V, key: K) => void): void {
    for (let i = 0; i < this.buckets.length; i++) {
      const bucket = this.buckets[i]!;
      for (let j = 0; j < bucket.length; j++) {
        const entry = bucket[j]!;
        callback(entry[1], entry[0]);
      }
    }
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries()[Symbol.iterator]();
  }

  resize(newCapacity: number): void {
    const oldBuckets = this.buckets;
    this.capacity = newCapacity;
    this._size = 0;
    this.buckets = [];

    for (let i = 0; i < this.capacity; i++) {
      this.buckets.push([]);
    }

    for (let i = 0; i < oldBuckets.length; i++) {
      const bucket = oldBuckets[i]!;
      for (let j = 0; j < bucket.length; j++) {
        const entry = bucket[j]!;
        this.set(entry[0], entry[1]);
      }
    }
  }

  getLoadFactor(): number {
    return this.loadFactor;
  }

  getCapacity(): number {
    return this.capacity;
  }

  getTimeComplexity(): string {
    return "O(1) average case, O(n) worst case";
  }

  toArray() {
    return this.entries()
  }

  toString(): string {
    return `${HashMap}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'HashMap', items: this.toArray() }
  }
}
