import type {
  FibonacciHashOptions,
  FibonacciHashStatistics,
  HashEntry,
} from "./types.js";
import { DEFAULT_FIBONACCI_HASH_OPTIONS } from "./types.js";

const INVERSE_GOLDEN_RATIO = 0.618033988749895;

export class FibonacciHashMap<K, V> {
  private table: Array<HashEntry<K, V> | undefined>;
  private _size = 0;
  private _capacity: number;
  private _loadFactor: number;
  private _probingStrategy: "linear" | "quadratic" | "double";
  private _collisions = 0;
  private _resizes = 0;
  private _tombstones = 0;
  private _maxProbeLength = 0;
  private _totalProbes = 0;

  constructor(options?: FibonacciHashOptions) {
    const opts = { ...DEFAULT_FIBONACCI_HASH_OPTIONS, ...options };
    this._capacity = opts.capacity;
    this._loadFactor = opts.loadFactor;
    this._probingStrategy = opts.probingStrategy;
    this.table = new Array<HashEntry<K, V> | undefined>(this._capacity);
  }

  private numericHash(key: K): number {
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = hash * 31 + str.charCodeAt(i);
    }
    return Math.abs(hash);
  }

  private hash(key: K): number {
    const numeric = this.numericHash(key);
    const product = numeric * INVERSE_GOLDEN_RATIO;
    const fraction = product - Math.floor(product);
    return Math.floor(this._capacity * fraction);
  }

  private secondaryHash(key: K): number {
    const numeric = this.numericHash(key);
    const prime = 7;
    return prime - (numeric % prime);
  }

  private probe(baseHash: number, i: number, key: K): number {
    switch (this._probingStrategy) {
      case "linear":
        return (baseHash + i) % this._capacity;
      case "quadratic":
        return (baseHash + i * i) % this._capacity;
      case "double":
        return (baseHash + i * this.secondaryHash(key)) % this._capacity;
    }
  }

  private shouldResize(): boolean {
    return (this._size + this._tombstones + 1) / this._capacity >= this._loadFactor;
  }

  private findExistingSlot(key: K): { index: number; probeLength: number } {
    const h = this.hash(key);
    let probeLength = 0;
    for (let i = 0; i < this._capacity; i++) {
      const idx = this.probe(h, i, key);
      probeLength++;
      const entry = this.table[idx];
      if (entry === undefined) {
        return { index: -1, probeLength };
      }
      if (entry.isDeleted) {
        continue;
      }
      if (entry.key === key || this.keysEqual(entry.key, key)) {
        return { index: idx, probeLength };
      }
    }
    return { index: -1, probeLength };
  }

  private findInsertSlot(key: K): { index: number; probeLength: number; firstTombstone: number } {
    const h = this.hash(key);
    let probeLength = 0;
    let firstTombstone = -1;
    for (let i = 0; i < this._capacity; i++) {
      const idx = this.probe(h, i, key);
      probeLength++;
      const entry = this.table[idx];
      if (entry === undefined) {
        const target = firstTombstone !== -1 ? firstTombstone : idx;
        return { index: target, probeLength, firstTombstone };
      }
      if (entry.isDeleted) {
        if (firstTombstone === -1) {
          firstTombstone = idx;
        }
        continue;
      }
      if (entry.key === key || this.keysEqual(entry.key, key)) {
        return { index: idx, probeLength, firstTombstone };
      }
    }
    if (firstTombstone !== -1) {
      return { index: firstTombstone, probeLength, firstTombstone };
    }
    return { index: -1, probeLength, firstTombstone };
  }

  private keysEqual(a: K, b: K): boolean {
    if (a === b) return true;
    if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
      return String(a) === String(b);
    }
    return false;
  }

  set(key: K, value: V): void {
    if (this.shouldResize()) {
      this.resize(this._capacity * 2);
    }
    const { index, probeLength, firstTombstone } = this.findInsertSlot(key);
    if (index === -1) {
      this.resize(this._capacity * 2);
      this.set(key, value);
      return;
    }
    const existing = this.table[index];
    if (existing !== undefined && !existing.isDeleted && (existing.key === key || this.keysEqual(existing.key, key))) {
      existing.value = value;
      this._totalProbes += probeLength;
      this._maxProbeLength = Math.max(this._maxProbeLength, probeLength);
      return;
    }
    if (firstTombstone !== -1 && firstTombstone === index) {
      this._tombstones--;
    }
    this.table[index] = { key, value, isDeleted: false };
    this._size++;
    this._totalProbes += probeLength;
    this._maxProbeLength = Math.max(this._maxProbeLength, probeLength);
  }

  get(key: K): V | undefined {
    const { index, probeLength } = this.findExistingSlot(key);
    this._totalProbes += probeLength;
    this._maxProbeLength = Math.max(this._maxProbeLength, probeLength);
    if (index === -1) return undefined;
    const entry = this.table[index];
    if (entry === undefined || entry.isDeleted) return undefined;
    return entry.value;
  }

  delete(key: K): boolean {
    const { index, probeLength } = this.findExistingSlot(key);
    this._totalProbes += probeLength;
    this._maxProbeLength = Math.max(this._maxProbeLength, probeLength);
    if (index === -1) return false;
    const entry = this.table[index];
    if (entry === undefined || entry.isDeleted) return false;
    entry.isDeleted = true;
    this._tombstones++;
    this._size--;
    return true;
  }

  has(key: K): boolean {
    const { index, probeLength } = this.findExistingSlot(key);
    this._totalProbes += probeLength;
    this._maxProbeLength = Math.max(this._maxProbeLength, probeLength);
    if (index === -1) return false;
    const entry = this.table[index];
    if (entry === undefined || entry.isDeleted) return false;
    return true;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.table = new Array<HashEntry<K, V> | undefined>(this._capacity);
    this._size = 0;
    this._tombstones = 0;
    this._collisions = 0;
    this._maxProbeLength = 0;
    this._totalProbes = 0;
  }

  keys(): K[] {
    const result: K[] = [];
    for (const entry of this.table) {
      if (entry !== undefined && !entry.isDeleted) {
        result.push(entry.key);
      }
    }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    for (const entry of this.table) {
      if (entry !== undefined && !entry.isDeleted) {
        result.push(entry.value);
      }
    }
    return result;
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = [];
    for (const entry of this.table) {
      if (entry !== undefined && !entry.isDeleted) {
        result.push([entry.key, entry.value]);
      }
    }
    return result;
  }

  forEach(callback: (value: V, key: K, map: FibonacciHashMap<K, V>) => void): void {
    for (const entry of this.table) {
      if (entry !== undefined && !entry.isDeleted) {
        callback(entry.value, entry.key, this);
      }
    }
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const entries = this.entries();
    let index = 0;
    return {
      next: () => {
        if (index < entries.length) {
          const result = { value: entries[index]!, done: false };
          index++;
          return result;
        }
        return { value: undefined as unknown as [K, V], done: true };
      },
    };
  }

  get loadFactor(): number {
    return (this._size + this._tombstones) / this._capacity;
  }

  get capacity(): number {
    return this._capacity;
  }

  getStatistics(): FibonacciHashStatistics {
    return {
      collisions: this._collisions,
      resizes: this._resizes,
      tombstones: this._tombstones,
      maxProbeLength: this._maxProbeLength,
      totalProbes: this._totalProbes,
    };
  }

  reserve(n: number): void {
    const targetSize = Math.ceil(n / this._loadFactor);
    if (targetSize > this._capacity) {
      let newCapacity = this._capacity;
      while (newCapacity < targetSize) {
        newCapacity *= 2;
      }
      this.resize(newCapacity);
    }
  }

  resize(newCapacity: number): void {
    const oldTable = this.table;
    this._capacity = newCapacity;
    this.table = new Array<HashEntry<K, V> | undefined>(newCapacity);
    const oldSize = this._size;
    this._size = 0;
    this._tombstones = 0;
    this._collisions = 0;
    this._maxProbeLength = 0;
    this._resizes++;
    for (const entry of oldTable) {
      if (entry !== undefined && !entry.isDeleted) {
        this.set(entry.key, entry.value);
      }
    }
    if (this._size !== oldSize) {
      throw new Error("Resize invariant violated");
    }
  }
}
