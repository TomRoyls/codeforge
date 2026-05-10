import {
  DEFAULT_PARTITIONED_HASH_OPTIONS,
  type PartitionedHashOptions,
  type PartitionedHashStatistics,
} from "./types.js";

export class PartitionedHashMap<K, V> {
  private partitions: Map<K, V>[];
  private partitionCount: number;
  private _maxLoadFactor: number;
  private stats = {
    inserts: 0,
    deletes: 0,
    lookups: 0,
    rebalances: 0,
  };

  constructor(options?: PartitionedHashOptions) {
    const merged = { ...DEFAULT_PARTITIONED_HASH_OPTIONS, ...options };
    const count = merged.partitionCount;
    if (count === undefined || count < 1 || !Number.isInteger(count)) {
      throw new RangeError("partitionCount must be a positive integer");
    }
    if (
      merged.loadFactor === undefined ||
      merged.loadFactor <= 0 ||
      merged.loadFactor > 1
    ) {
      throw new RangeError("loadFactor must be in (0, 1]");
    }
    this.partitionCount = count;
    this._maxLoadFactor = merged.loadFactor;
    this.partitions = [];
    for (let i = 0; i < this.partitionCount; i++) {
      this.partitions.push(new Map());
    }
  }

  private computeHash(key: K): number {
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash + ch) | 0;
    }
    return hash >>> 0;
  }

  private resolvePartition(key: K): Map<K, V> {
    const idx = this.computeHash(key) % this.partitionCount;
    const partition = this.partitions[idx];
    if (!partition) {
      throw new Error(`Partition ${idx} is undefined`);
    }
    return partition;
  }

  set(key: K, value: V): this {
    const partition = this.resolvePartition(key);
    const isUpdate = partition.has(key);
    partition.set(key, value);
    if (!isUpdate) {
      this.stats.inserts++;
    }
    return this;
  }

  get(key: K): V | undefined {
    this.stats.lookups++;
    return this.resolvePartition(key).get(key);
  }

  delete(key: K): boolean {
    const deleted = this.resolvePartition(key).delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  has(key: K): boolean {
    this.stats.lookups++;
    return this.resolvePartition(key).has(key);
  }

  get size(): number {
    let total = 0;
    for (const partition of this.partitions) {
      total += partition.size;
    }
    return total;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  clear(): void {
    for (const partition of this.partitions) {
      partition.clear();
    }
    this.stats.inserts = 0;
    this.stats.deletes = 0;
    this.stats.lookups = 0;
    this.stats.rebalances = 0;
  }

  keys(): IterableIterator<K> {
    function* generator(partitions: Map<K, V>[]): IterableIterator<K> {
      for (const partition of partitions) {
        yield* partition.keys();
      }
    }
    return generator(this.partitions);
  }

  values(): IterableIterator<V> {
    function* generator(partitions: Map<K, V>[]): IterableIterator<V> {
      for (const partition of partitions) {
        yield* partition.values();
      }
    }
    return generator(this.partitions);
  }

  entries(): IterableIterator<[K, V]> {
    function* generator(partitions: Map<K, V>[]): IterableIterator<[K, V]> {
      for (const partition of partitions) {
        yield* partition.entries();
      }
    }
    return generator(this.partitions);
  }

  forEach(callback: (value: V, key: K, map: PartitionedHashMap<K, V>) => void): void {
    for (const partition of this.partitions) {
      for (const [key, value] of partition) {
        callback(value, key, this);
      }
    }
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  getPartition(key: K): number {
    return this.computeHash(key) % this.partitionCount;
  }

  getPartitionSize(idx: number): number {
    if (idx < 0 || idx >= this.partitionCount) {
      throw new RangeError(`Partition index ${idx} out of range [0, ${this.partitionCount})`);
    }
    const partition = this.partitions[idx];
    return partition ? partition.size : 0;
  }

  getPartitionCount(): number {
    return this.partitionCount;
  }

  rebalance(): void {
    const allEntries: [K, V][] = [];
    for (const partition of this.partitions) {
      for (const entry of partition) {
        allEntries.push(entry);
      }
    }

    for (const partition of this.partitions) {
      partition.clear();
    }

    for (const [key, value] of allEntries) {
      this.resolvePartition(key).set(key, value);
    }

    this.stats.rebalances++;
  }

  getStatistics(): PartitionedHashStatistics {
    let maxSize = 0;
    let minSize = Infinity;
    for (const partition of this.partitions) {
      const s = partition.size;
      if (s > maxSize) maxSize = s;
      if (s < minSize) minSize = s;
    }
    if (minSize === Infinity) minSize = 0;
    return {
      inserts: this.stats.inserts,
      deletes: this.stats.deletes,
      lookups: this.stats.lookups,
      rebalances: this.stats.rebalances,
      maxPartitionSize: maxSize,
      minPartitionSize: minSize,
    };
  }

  get loadFactor(): number {
    if (this.partitionCount === 0) return 0;
    return this.size / this.partitionCount;
  }
}
