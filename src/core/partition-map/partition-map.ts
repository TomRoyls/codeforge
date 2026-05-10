import type { PartitionMapOptions, PartitionMapStats } from './types.js'

export class PartitionMap<T, K> {
  private buckets: Map<K, T[]> = new Map()
  private keyFn: (item: T) => K
  private cap: number | null
  private _size: number = 0

  constructor(options: PartitionMapOptions<T, K>) {
    this.keyFn = options.partitionKey
    this.cap = options.capacity ?? null
  }

  add(item: T): boolean {
    const key = this.keyFn(item)
    let bucket = this.buckets.get(key)
    if (bucket === undefined) {
      bucket = []
      this.buckets.set(key, bucket)
    }
    if (this.cap !== null && bucket.length >= this.cap) {
      return false
    }
    bucket.push(item)
    this._size++
    return true
  }

  remove(item: T): boolean {
    const key = this.keyFn(item)
    const bucket = this.buckets.get(key)
    if (bucket === undefined) {
      return false
    }
    const index = bucket.indexOf(item)
    if (index === -1) {
      return false
    }
    bucket.splice(index, 1)
    this._size--
    if (bucket.length === 0) {
      this.buckets.delete(key)
    }
    return true
  }

  has(item: T): boolean {
    const key = this.keyFn(item)
    const bucket = this.buckets.get(key)
    if (bucket === undefined) {
      return false
    }
    return bucket.includes(item)
  }

  getPartition(key: K): T[] {
    const bucket = this.buckets.get(key)
    if (bucket === undefined) {
      return []
    }
    return [...bucket]
  }

  get partitions(): K[] {
    return [...this.buckets.keys()]
  }

  partitionSize(key: K): number {
    const bucket = this.buckets.get(key)
    if (bucket === undefined) {
      return 0
    }
    return bucket.length
  }

  get size(): number {
    return this._size
  }

  get partitionCount(): number {
    return this.buckets.size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.buckets.clear()
    this._size = 0
  }

  forEach(callback: (item: T, key: K) => void): void {
    for (const [key, bucket] of this.buckets) {
      for (let i = 0; i < bucket.length; i++) {
        callback(bucket[i]!, key)
      }
    }
  }

  toArray(): T[] {
    const result: T[] = []
    for (const bucket of this.buckets.values()) {
      for (let i = 0; i < bucket.length; i++) {
        result.push(bucket[i]!)
      }
    }
    return result
  }

  items(): T[] {
    return this.toArray()
  }

  static from<T, K>(items: T[], options: PartitionMapOptions<T, K>): PartitionMap<T, K> {
    const pm = new PartitionMap<T, K>(options)
    for (let i = 0; i < items.length; i++) {
      pm.add(items[i]!)
    }
    return pm
  }

  rebalance(): void {
    const allItems = this.toArray()
    this.buckets.clear()
    this._size = 0
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i]!
      const key = this.keyFn(item)
      let bucket = this.buckets.get(key)
      if (bucket === undefined) {
        bucket = []
        this.buckets.set(key, bucket)
      }
      bucket.push(item)
      this._size++
    }
  }

  stats(): PartitionMapStats {
    let maxItems = 0
    let minItems = Infinity
    for (const bucket of this.buckets.values()) {
      if (bucket.length > maxItems) {
        maxItems = bucket.length
      }
      if (bucket.length < minItems) {
        minItems = bucket.length
      }
    }
    if (this.buckets.size === 0) {
      minItems = 0
    }
    return {
      partitionCount: this.buckets.size,
      totalItems: this._size,
      isEmpty: this._size === 0,
      avgItemsPerPartition: this.buckets.size === 0 ? 0 : this._size / this.buckets.size,
      maxItemsPerPartition: maxItems,
      minItemsPerPartition: minItems,
      capacity: this.cap,
    }
  }
}

export type { PartitionMapOptions, PartitionMapStats } from './types.js'
