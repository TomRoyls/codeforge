import type { CuckooFilterOptions, CuckooFilterStatistics, HashFunction } from './types.js'
import { DEFAULT_FINGERPRINT_SIZE, DEFAULT_MAX_KICKS, BUCKET_SIZE, defaultHash } from './types.js'

export class CuckooFilter<T = string> {
  private buckets: (number | null)[][]
  private _bucketCount: number
  private _fingerprintSize: number
  private _maxKicks: number
  private _capacity: number
  private _size: number
  private _hashFunction: HashFunction

  constructor(capacity: number, options?: CuckooFilterOptions) {
    this._capacity = Math.max(1, capacity)
    this._fingerprintSize = options?.fingerprintSize ?? DEFAULT_FINGERPRINT_SIZE
    this._maxKicks = options?.maxKicks ?? DEFAULT_MAX_KICKS
    this._hashFunction = options?.hashFunction ?? defaultHash
    this._bucketCount = Math.max(1, Math.ceil(this._capacity / BUCKET_SIZE))
    this._size = 0
    this.buckets = []
    for (let i = 0; i < this._bucketCount; i++) {
      this.buckets.push(new Array<number | null>(BUCKET_SIZE).fill(null))
    }
  }

  add(item: T): boolean { return this.insert(item) }

  insert(item: T): boolean {
    const key = this.serialize(item)
    const fp = this.fingerprint(key)
    const i1 = this.hashIndex(key)
    const i2 = this.altIndex(i1, fp)

    if (this.insertIntoBucket(i1, fp)) {
      this._size++
      return true
    }
    if (this.insertIntoBucket(i2, fp)) {
      this._size++
      return true
    }

    let currentIndex = i1
    let currentFp = fp

    for (let n = 0; n < this._maxKicks; n++) {
      const slotIndex = n % BUCKET_SIZE
      const bucket = this.buckets[currentIndex]!
      const evictedFp = bucket[slotIndex]
      bucket[slotIndex] = currentFp

      if (evictedFp === null) {
        this._size++
        return true
      }

      currentFp = evictedFp!
      currentIndex = this.altIndex(currentIndex, currentFp)

      if (this.insertIntoBucket(currentIndex, currentFp)) {
        this._size++
        return true
      }
    }

    return false
  }

  contains(item: T): boolean {
    const key = this.serialize(item)
    const fp = this.fingerprint(key)
    const i1 = this.hashIndex(key)
    const i2 = this.altIndex(i1, fp)
    return this.bucketContains(i1, fp) || this.bucketContains(i2, fp)
  }

  remove(item: T): boolean {
    const key = this.serialize(item)
    const fp = this.fingerprint(key)
    const i1 = this.hashIndex(key)
    const i2 = this.altIndex(i1, fp)

    if (this.removeFromBucket(i1, fp)) {
      this._size--
      return true
    }
    if (this.removeFromBucket(i2, fp)) {
      this._size--
      return true
    }

    return false
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  get loadFactor(): number {
    const totalSlots = this._bucketCount * BUCKET_SIZE
    return totalSlots > 0 ? this._size / totalSlots : 0
  }

  get falsePositiveRate(): number {
    if (this._size === 0) return 0
    const f = this._fingerprintSize
    const b = BUCKET_SIZE
    return 1 - Math.pow(1 - Math.pow(2, -f), b)
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this._bucketCount; i++) {
      this.buckets[i] = new Array<number | null>(BUCKET_SIZE).fill(null)
    }
    this._size = 0
  }

  clone(): CuckooFilter<T> {
    const cloned = new CuckooFilter<T>(this._capacity, {
      fingerprintSize: this._fingerprintSize,
      maxKicks: this._maxKicks,
      hashFunction: this._hashFunction,
    })
    cloned._size = this._size
    cloned.buckets = this.buckets.map((bucket) => [...bucket])
    return cloned
  }

  static fromItems<U>(items: U[], options?: CuckooFilterOptions): CuckooFilter<U> {
    const capacity = Math.max(items.length * 4, 1)
    const filter = new CuckooFilter<U>(capacity, options)
    for (const item of items) {
      if (!filter.insert(item)) {
        break
      }
    }
    return filter
  }

  forEach(callback: (fingerprint: number, bucketIndex: number, slotIndex: number) => void): void {
    for (let b = 0; b < this._bucketCount; b++) {
      const bucket = this.buckets[b]!
      for (let s = 0; s < BUCKET_SIZE; s++) {
        const val = bucket[s]
        if (val !== null) {
          callback(val!, b, s)
        }
      }
    }
  }

  *[Symbol.iterator](): Iterator<number> {
    for (let b = 0; b < this._bucketCount; b++) {
      const bucket = this.buckets[b]!
      for (let s = 0; s < BUCKET_SIZE; s++) {
        const val = bucket[s]
        if (val !== null) {
          yield val!
        }
      }
    }
  }

  toStats(): CuckooFilterStatistics {
    const totalSlots = this._bucketCount * BUCKET_SIZE
    let filledSlots = 0
    for (let b = 0; b < this._bucketCount; b++) {
      const bucket = this.buckets[b]!
      for (let s = 0; s < BUCKET_SIZE; s++) {
        if (bucket[s] !== null) {
          filledSlots++
        }
      }
    }
    return {
      size: this._size,
      capacity: this._capacity,
      loadFactor: this.loadFactor,
      falsePositiveRate: this.falsePositiveRate,
      fingerprintSize: this._fingerprintSize,
      maxKicks: this._maxKicks,
      bucketSize: BUCKET_SIZE,
      filledSlots,
      totalSlots,
    }
  }

  private serialize(item: T): string {
    return JSON.stringify(item)
  }

  private fingerprint(key: string): number {
    const hash = this._hashFunction(key)
    const mask = (1 << this._fingerprintSize) - 1
    const fp = (hash & mask) | 1
    return fp
  }

  private hashIndex(key: string): number {
    const hash = this._hashFunction(key)
    return ((hash % this._bucketCount) + this._bucketCount) % this._bucketCount
  }

  private altIndex(index: number, fp: number): number {
    const fpHash = this.hashFP(fp)
    return ((index ^ fpHash) >>> 0) % this._bucketCount
  }

  private insertIntoBucket(bucketIndex: number, fp: number): boolean {
    const bucket = this.buckets[bucketIndex]!
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i] === null) {
        bucket[i] = fp
        return true
      }
    }
    return false
  }

  private bucketContains(bucketIndex: number, fp: number): boolean {
    const bucket = this.buckets[bucketIndex]!
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i] === fp) {
        return true
      }
    }
    return false
  }

  private removeFromBucket(bucketIndex: number, fp: number): boolean {
    const bucket = this.buckets[bucketIndex]!
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i] === fp) {
        bucket[i] = null
        return true
      }
    }
    return false
  }

  private hashFP(fp: number): number {
    let h = fp
    h = ((h >> 16) ^ h) * 0x45d9f3b
    h = ((h >> 16) ^ h) * 0x45d9f3b
    h = (h >> 16) ^ h
    return h >>> 0
  }

  toArray() {
    return [...this]
  }

  toString(): string {
    return `${CuckooFilter}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  has(item: T): boolean {
    return this.contains(item)
  }

  toJSON() {
    return { type: 'CuckooFilter', size: this.size, items: this.toArray() }
  }


}

export { BUCKET_SIZE, DEFAULT_FINGERPRINT_SIZE, DEFAULT_MAX_KICKS, defaultHash } from './types.js'
export type { CuckooFilterOptions, CuckooFilterStatistics, HashFunction 
} from './types.js'
