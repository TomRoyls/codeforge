import { DEFAULT_CUCKOO_BLOOM_OPTIONS } from './types.js'

export class CuckooBloomFilter<T = string> {
  private buckets: (number | null)[][]
  private _bucketCount: number
  private _bucketSize: number
  private _maxKicks: number
  private _fingerprintSize: number
  private _capacity: number
  private _size: number = 0

  constructor(
    capacity: number = DEFAULT_CUCKOO_BLOOM_OPTIONS.capacity,
    fingerprintSize: number = DEFAULT_CUCKOO_BLOOM_OPTIONS.fingerprintSize,
    bucketSize: number = DEFAULT_CUCKOO_BLOOM_OPTIONS.bucketSize,
    maxKicks: number = DEFAULT_CUCKOO_BLOOM_OPTIONS.maxKicks,
  ) {
    this._capacity = capacity
    this._fingerprintSize = fingerprintSize
    this._bucketSize = bucketSize
    this._maxKicks = maxKicks
    this._bucketCount = Math.ceil(capacity / bucketSize)
    this.buckets = []
    for (let i = 0; i < this._bucketCount; i++) {
      this.buckets.push(new Array<number | null>(this._bucketSize).fill(null))
    }
  }

  add(item: T): boolean {
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

    let currentIndex = Math.random() < 0.5 ? i1 : i2

    for (let n = 0; n < this._maxKicks; n++) {
      const slotIndex = n % this._bucketSize
      const bucket = this.buckets[currentIndex]!
      const evictedFp = bucket[slotIndex]!
      bucket[slotIndex] = fp

      if (evictedFp === null) {
        this._size++
        return true
      }

      currentIndex = this.altIndex(currentIndex, evictedFp)

      if (this.insertIntoBucket(currentIndex, evictedFp)) {
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

  get falsePositiveRate(): number {
    if (this._size === 0) return 0
    const f = this._fingerprintSize
    const b = this._bucketSize
    return 1 - Math.pow(1 - Math.pow(2, -f), b)
  }

  get fillRatio(): number {
    const totalSlots = this._bucketCount * this._bucketSize
    return totalSlots > 0 ? this._size / totalSlots : 0
  }

  clear(): void {
    for (let i = 0; i < this._bucketCount; i++) {
      this.buckets[i] = new Array<number | null>(this._bucketSize).fill(null)
    }
    this._size = 0
  }

  toString(): string {
    return `CuckooBloomFilter { capacity: ${this._capacity}, size: ${this._size}, fillRatio: ${this.fillRatio.toFixed(4)}, falsePositiveRate: ${this.falsePositiveRate.toFixed(6)} }`
  }

  clone(): CuckooBloomFilter<T> {
    const cloned = new CuckooBloomFilter<T>(
      this._capacity,
      this._fingerprintSize,
      this._bucketSize,
      this._maxKicks,
    )
    cloned._size = this._size
    cloned.buckets = this.buckets.map((bucket) => [...bucket])
    return cloned
  }

  private serialize(item: T): string {
    return JSON.stringify(item)
  }

  private fingerprint(key: string): number {
    const hash = this.hash(key, 0)
    const mask = (1 << this._fingerprintSize) - 1
    const fp = (hash & mask) | 1
    return fp
  }

  private hashIndex(key: string): number {
    const hash = this.hash(key, 0x9e3779b9)
    return hash % this._bucketCount
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

  private hash(str: string, seed: number): number {
    let h1 = 0xdeadbeef ^ seed
    let h2 = 0x41c6ce57 ^ seed
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0
  }

  private hashFP(fp: number): number {
    let h = fp
    h = ((h >> 16) ^ h) * 0x45d9f3b
    h = ((h >> 16) ^ h) * 0x45d9f3b
    h = (h >> 16) ^ h
    return (h >>> 0)
  }
}

export { DEFAULT_CUCKOO_BLOOM_OPTIONS } from './types.js'
export type { CuckooBloomOptions } from './types.js'
