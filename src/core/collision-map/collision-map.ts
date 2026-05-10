import type { CollisionMapOptions, CollisionEntry } from './types.js'

export class CollisionMap<V = string> {
  private buckets: CollisionEntry<V>[][]
  private _bucketCount: number
  private _hashFn: (key: string) => number
  private _size: number = 0

  constructor(options?: CollisionMapOptions) {
    this._bucketCount = options?.bucketCount ?? 256
    this._hashFn = options?.hashFn ?? CollisionMap.djb2
    this.buckets = this.createBuckets(this._bucketCount)
  }

  static djb2(key: string): number {
    let hash = 5381
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) + hash + key.charCodeAt(i)) | 0
    }
    return hash >>> 0
  }

  private createBuckets(count: number): CollisionEntry<V>[][] {
    const buckets: CollisionEntry<V>[][] = []
    for (let i = 0; i < count; i++) {
      buckets.push([])
    }
    return buckets
  }

  private bucketIndex(hash: number): number {
    return hash % this._bucketCount
  }

  insert(key: string, value?: V): this {
    const hash = this._hashFn(key)
    const index = this.bucketIndex(hash)
    const existing = this.buckets[index]!.find((entry) => entry.key === key)
    if (existing) {
      existing.value = value
    } else {
      this.buckets[index]!.push({ key, value, hash })
      this._size++
    }
    return this
  }

  get(key: string): CollisionEntry<V>[] {
    const hash = this._hashFn(key)
    const index = this.bucketIndex(hash)
    return this.buckets[index]!.filter((entry) => entry.key === key)
  }

  has(key: string): boolean {
    const hash = this._hashFn(key)
    const index = this.bucketIndex(hash)
    return this.buckets[index]!.some((entry) => entry.key === key)
  }

  delete(key: string): boolean {
    const hash = this._hashFn(key)
    const index = this.bucketIndex(hash)
    const bucket = this.buckets[index]!
    const pos = bucket.findIndex((entry) => entry.key === key)
    if (pos === -1) {
      return false
    }
    bucket.splice(pos, 1)
    this._size--
    return true
  }

  get collisions(): Map<number, string[]> {
    const result = new Map<number, string[]>()
    for (let i = 0; i < this._bucketCount; i++) {
      const bucket = this.buckets[i]!
      if (bucket.length > 1) {
        result.set(i, bucket.map((entry) => entry.key))
      }
    }
    return result
  }

  get collisionCount(): number {
    let count = 0
    for (let i = 0; i < this._bucketCount; i++) {
      if (this.buckets[i]!.length > 1) {
        count++
      }
    }
    return count
  }

  get maxChainLength(): number {
    let max = 0
    for (let i = 0; i < this._bucketCount; i++) {
      const len = this.buckets[i]!.length
      if (len > max) {
        max = len
      }
    }
    return max
  }

  get avgChainLength(): number {
    if (this._bucketCount === 0) return 0
    return this._size / this._bucketCount
  }

  get loadFactor(): number {
    if (this._bucketCount === 0) return 0
    return this._size / this._bucketCount
  }

  get size(): number {
    return this._size
  }

  get bucketCount(): number {
    return this._bucketCount
  }

  clear(): void {
    for (let i = 0; i < this._bucketCount; i++) {
      this.buckets[i]!.length = 0
    }
    this._size = 0
  }

  *keys(): IterableIterator<string> {
    for (let i = 0; i < this._bucketCount; i++) {
      for (const entry of this.buckets[i]!) {
        yield entry.key
      }
    }
  }

  *values(): IterableIterator<V | undefined> {
    for (let i = 0; i < this._bucketCount; i++) {
      for (const entry of this.buckets[i]!) {
        yield entry.value
      }
    }
  }

  *entries(): IterableIterator<[string, V | undefined]> {
    for (let i = 0; i < this._bucketCount; i++) {
      for (const entry of this.buckets[i]!) {
        yield [entry.key, entry.value]
      }
    }
  }

  rehash(newBucketCount: number): void {
    const oldBuckets = this.buckets
    this._bucketCount = newBucketCount
    this.buckets = this.createBuckets(newBucketCount)
    this._size = 0
    for (const bucket of oldBuckets) {
      for (const entry of bucket) {
        this.insert(entry.key, entry.value)
      }
    }
  }

  bucketOf(key: string): number {
    const hash = this._hashFn(key)
    return this.bucketIndex(hash)
  }

  itemsInBucket(bucket: number): CollisionEntry<V>[] {
    if (bucket < 0 || bucket >= this._bucketCount) {
      return []
    }
    return [...this.buckets[bucket]!]
  }

  distribution(): number[] {
    const result: number[] = new Array(this._bucketCount).fill(0) as number[]
    for (let i = 0; i < this._bucketCount; i++) {
      result[i] = this.buckets[i]!.length
    }
    return result
  }

  uniformity(): number {
    if (this._size === 0 || this._bucketCount === 0) return 1
    const expected = this._size / this._bucketCount
    let chiSquared = 0
    for (let i = 0; i < this._bucketCount; i++) {
      const observed = this.buckets[i]!.length
      chiSquared += ((observed - expected) * (observed - expected)) / expected
    }
    const maxChi = (this._bucketCount - 1) * 4
    const score = 1 - Math.min(chiSquared / maxChi, 1)
    return Math.max(0, Math.min(1, score))
  }
}
