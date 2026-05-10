import type {
  SplitOrderedListOptions,
  SplitOrderedListStatistics,
} from "./types.js";
import {
  DEFAULT_SPLIT_ORDERED_LIST_OPTIONS,
} from "./types.js";

interface Node<K, V> {
  key: K;
  value: V;
  reversedHash: number;
  next: Node<K, V> | null;
}

class Bucket<K, V> {
  head: Node<K, V> | null;

  constructor(head: Node<K, V> | null = null) {
    this.head = head;
  }
}

function reverseBits(hash: number): number {
  let result = 0;
  let n = hash;
  for (let i = 0; i < 32; i++) {
    result = (result << 1) | (n & 1);
    n >>>= 1;
  }
  return result >>> 0;
}

function parentBucket(index: number): number {
  return index & ((1 << (Math.floor(Math.log2(index)) - 1)) - 1);
}

export class SplitOrderedList<K, V> {
  private buckets: Array<Bucket<K, V>>;
  private bucketMask: number;
  private readonly maxLoadFactor: number;
  private _size = 0;
  private readonly stats: SplitOrderedListStatistics = {
    inserts: 0,
    deletes: 0,
    lookups: 0,
    resizes: 0,
    bucketCount: 0,
  };
  private headSentinel: Node<K, V>;

  constructor(options?: SplitOrderedListOptions) {
    const opts = { ...DEFAULT_SPLIT_ORDERED_LIST_OPTIONS, ...options };
    const initialBuckets = Math.max(1, opts.initialBuckets!);
    this.maxLoadFactor = opts.loadFactor!;

    this.headSentinel = {
      key: undefined as unknown as K,
      value: undefined as unknown as V,
      reversedHash: 0,
      next: null,
    };

    this.buckets = [];
    this.bucketMask = initialBuckets - 1;
    for (let i = 0; i < initialBuckets; i++) {
      this.buckets.push(new Bucket<K, V>(this.headSentinel));
    }
    this.stats.bucketCount = initialBuckets;
  }

  private hashKey(key: K): number {
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash + ch) | 0;
    }
    return hash >>> 0;
  }

  private getBucketIndex(reversedHash: number): number {
    return reversedHash & this.bucketMask;
  }

  private findInsertPoint(
    reversedHash: number,
    key: K,
  ): { prev: Node<K, V>; found: Node<K, V> | null } {
    let prev = this.headSentinel;
    let curr = prev.next;

    while (curr !== null && curr.reversedHash < reversedHash) {
      prev = curr;
      curr = curr.next;
    }

    while (
      curr !== null &&
      curr.reversedHash === reversedHash &&
      curr.key !== key
    ) {
      prev = curr;
      curr = curr.next;
    }

    if (
      curr !== null &&
      curr.reversedHash === reversedHash &&
      this.keyEquals(curr.key, key)
    ) {
      return { prev, found: curr };
    }

    return { prev, found: null };
  }

  private keyEquals(a: K, b: K): boolean {
    return a === b || (Number.isNaN(a) && Number.isNaN(b));
  }

  private findNode(key: K): Node<K, V> | null {
    const hash = this.hashKey(key);
    const reversedHash = reverseBits(hash);
    const { found } = this.findInsertPoint(reversedHash, key);
    return found;
  }

  private updateBucketPointer(bucketIdx: number): void {
    const sentinel = this.headSentinel;
    let curr = sentinel.next;
    const targetReversedHash = reverseBits(bucketIdx);

    if (curr === null) {
      this.buckets[bucketIdx] = new Bucket<K, V>(sentinel);
      return;
    }

    let prev: Node<K, V> = sentinel;
    while (curr !== null && curr.reversedHash < targetReversedHash) {
      prev = curr;
      curr = curr.next;
    }

    while (
      curr !== null &&
      curr.reversedHash === targetReversedHash
    ) {
      prev = curr;
      curr = curr.next;
    }

    this.buckets[bucketIdx] = new Bucket<K, V>(prev);
  }

  private growTable(): void {
    const oldCapacity = this.buckets.length;
    const newCapacity = oldCapacity * 2;
    const newMask = newCapacity - 1;

    for (let i = oldCapacity; i < newCapacity; i++) {
      const parentIdx = parentBucket(i);
      const parentBucketRef = this.buckets[parentIdx];
      if (parentIdx < oldCapacity && parentBucketRef) {
        this.buckets.push(new Bucket<K, V>(parentBucketRef.head));
      } else {
        this.updateBucketPointer(i);
      }
    }

    this.bucketMask = newMask;
    this.stats.bucketCount = newCapacity;
    this.stats.resizes++;

    for (let i = 0; i < newCapacity; i++) {
      this.updateBucketPointer(i);
    }
  }

  private checkLoadFactor(): void {
    if (this._size >= this.buckets.length * this.maxLoadFactor) {
      this.growTable();
    }
  }

  set(key: K, value: V): void {
    const hash = this.hashKey(key);
    const reversedHash = reverseBits(hash);

    const { prev, found } = this.findInsertPoint(reversedHash, key);

    if (found !== null) {
      found.value = value;
      this.stats.inserts++;
      return;
    }

    const newNode: Node<K, V> = {
      key,
      value,
      reversedHash,
      next: prev.next,
    };
    prev.next = newNode;
    this._size++;
    this.stats.inserts++;

    const bucketIdx = this.getBucketIndex(reversedHash);
    const bucket = this.buckets[bucketIdx];
    if (bucket && bucket.head !== null && bucket.head !== this.headSentinel) {
      const bucketHead = bucket.head;
      if (
        bucketHead.reversedHash > reversedHash ||
        (bucketHead.reversedHash === reversedHash &&
          bucketHead !== newNode &&
          !this.isBeforeInList(bucketHead, newNode))
      ) {
        this.buckets[bucketIdx] = new Bucket<K, V>(prev);
      }
    }

    this.checkLoadFactor();
  }

  private isBeforeInList(
    nodeA: Node<K, V>,
    nodeB: Node<K, V>,
  ): boolean {
    let curr = this.headSentinel.next;
    while (curr !== null) {
      if (curr === nodeA) return true;
      if (curr === nodeB) return false;
      curr = curr.next;
    }
    return false;
  }

  get(key: K): V | undefined {
    this.stats.lookups++;
    const node = this.findNode(key);
    return node !== null ? node.value : undefined;
  }

  delete(key: K): boolean {
    this.stats.deletes++;
    const hash = this.hashKey(key);
    const reversedHash = reverseBits(hash);

    let prev: Node<K, V> = this.headSentinel;
    let curr = prev.next;

    while (curr !== null && curr.reversedHash < reversedHash) {
      prev = curr;
      curr = curr.next;
    }

    while (
      curr !== null &&
      curr.reversedHash === reversedHash &&
      !this.keyEquals(curr.key, key)
    ) {
      prev = curr;
      curr = curr.next;
    }

    if (
      curr !== null &&
      curr.reversedHash === reversedHash &&
      this.keyEquals(curr.key, key)
    ) {
      prev.next = curr.next;
      this._size--;

      const bucketIdx = this.getBucketIndex(reversedHash);
      const bucket = this.buckets[bucketIdx];
      if (bucket && bucket.head === curr) {
        this.updateBucketPointer(bucketIdx);
      }

      return true;
    }

    return false;
  }

  has(key: K): boolean {
    this.stats.lookups++;
    return this.findNode(key) !== null;
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.headSentinel.next = null;
    this._size = 0;
    const capacity = this.buckets.length;
    this.buckets = [];
    this.bucketMask = capacity - 1;
    for (let i = 0; i < capacity; i++) {
      this.buckets.push(new Bucket<K, V>(this.headSentinel));
    }
    this.stats.inserts = 0;
    this.stats.deletes = 0;
    this.stats.lookups = 0;
    this.stats.resizes = 0;
    this.stats.bucketCount = capacity;
  }

  keys(): K[] {
    const result: K[] = [];
    let curr = this.headSentinel.next;
    while (curr !== null) {
      result.push(curr.key);
      curr = curr.next;
    }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    let curr = this.headSentinel.next;
    while (curr !== null) {
      result.push(curr.value);
      curr = curr.next;
    }
    return result;
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = [];
    let curr = this.headSentinel.next;
    while (curr !== null) {
      result.push([curr.key, curr.value]);
      curr = curr.next;
    }
    return result;
  }

  forEach(callback: (value: V, key: K, map: SplitOrderedList<K, V>) => void): void {
    let curr = this.headSentinel.next;
    while (curr !== null) {
      callback(curr.value, curr.key, this);
      curr = curr.next;
    }
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    let curr = this.headSentinel.next;
    return {
      next(): IteratorResult<[K, V]> {
        if (curr === null) {
          return { value: undefined, done: true } as IteratorResult<[K, V]>;
        }
        const entry: [K, V] = [curr.key, curr.value];
        curr = curr.next;
        return { value: entry, done: false };
      },
    };
  }

  get loadFactor(): number {
    return this._size / this.buckets.length;
  }

  get bucketCount(): number {
    return this.buckets.length;
  }

  getStatistics(): SplitOrderedListStatistics {
    return { ...this.stats };
  }

  reserve(n: number): void {
    const needed = Math.max(1, Math.ceil(n / this.maxLoadFactor));
    let capacity = this.buckets.length;
    while (capacity < needed) {
      capacity *= 2;
    }
    while (this.buckets.length < capacity) {
      const idx = this.buckets.length;
      const parentIdx = parentBucket(idx);
      const parent = this.buckets[parentIdx];
      if (parent) {
        this.buckets.push(new Bucket<K, V>(parent.head));
      } else {
        this.buckets.push(new Bucket<K, V>(this.headSentinel));
      }
    }
    this.bucketMask = capacity - 1;
    this.stats.bucketCount = capacity;
    this.stats.resizes++;
    for (let i = 0; i < capacity; i++) {
      this.updateBucketPointer(i);
    }
  }
}
