import type { CuckooFilterOptions } from './types.js'
import { DEFAULT_CUCKOOFILTER_OPTIONS } from './types.js'

export class CuckooFilter {
  private buckets: (number | null)[][]
  private bucketCount: number
  private bucketSize: number
  private maxKicks: number
  private fingerprintSize: number
  private _capacity: number
  private _size: number = 0

  constructor(options?: Partial<CuckooFilterOptions>) {
    const opts: CuckooFilterOptions = { ...DEFAULT_CUCKOOFILTER_OPTIONS, ...options }
    this._capacity = opts.capacity
    this.bucketSize = opts.bucketSize
    this.maxKicks = opts.maxKicks
    this.fingerprintSize = opts.fingerprintSize
    this.bucketCount = Math.ceil(opts.capacity / opts.bucketSize)
    this.buckets = []
    for (let i = 0; i < this.bucketCount; i++) {
      this.buckets.push(new Array<number | null>(this.bucketSize).fill(null))
    }
  }

  add(item: string): boolean {
    const fp = this.fingerprint(item)
    const i1 = this.hashIndex(item)
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
    let currentFp = fp

    for (let n = 0; n < this.maxKicks; n++) {
      const slotIndex = Math.floor(Math.random() * this.bucketSize)
      const evictedFp = this.buckets[currentIndex]![slotIndex]!
      this.buckets[currentIndex]![slotIndex] = currentFp
      currentFp = evictedFp
      currentIndex = this.altIndex(currentIndex, currentFp)

      if (this.insertIntoBucket(currentIndex, currentFp)) {
        this._size++
        return true
      }
    }

    return false
  }

  contains(item: string): boolean {
    const fp = this.fingerprint(item)
    const i1 = this.hashIndex(item)
    const i2 = this.altIndex(i1, fp)
    return this.bucketContains(i1, fp) || this.bucketContains(i2, fp)
  }

  remove(item: string): boolean {
    const fp = this.fingerprint(item)
    const i1 = this.hashIndex(item)
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

  size(): number {
    return this._size
  }

  capacity(): number {
    return this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  fillRatio(): number {
    const totalSlots = this.bucketCount * this.bucketSize
    return totalSlots > 0 ? this._size / totalSlots : 0
  }

  reset(): void {
    for (let i = 0; i < this.bucketCount; i++) {
      this.buckets[i] = new Array<number | null>(this.bucketSize).fill(null)
    }
    this._size = 0
  }

  merge(other: CuckooFilter): void {
    const otherBuckets = other.getBuckets()
    for (let i = 0; i < this.bucketCount && i < otherBuckets.length; i++) {
      for (let j = 0; j < this.bucketSize && j < otherBuckets[i]!.length; j++) {
        const otherFp: number | null | undefined = otherBuckets[i]![j]
        if (otherFp != null && this.buckets[i]![j] === null) {
          this.buckets[i]![j] = otherFp
          this._size++
        }
      }
    }
  }

  private getBuckets(): (number | null)[][] {
    return this.buckets
  }

  private fingerprint(item: string): number {
    const hash = this.hash(item, 0)
    const mask = (1 << this.fingerprintSize) - 1
    const fp = (hash & mask) | 1
    return fp
  }

  private hashIndex(item: string): number {
    const hash = this.hash(item, 0x9e3779b9)
    return hash % this.bucketCount
  }

  private altIndex(index: number, fp: number): number {
    const fpHash = this.hashFP(fp)
    return (index ^ fpHash) % this.bucketCount
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
    return (h >>> 0) % this.bucketCount
  }
}

export { DEFAULT_CUCKOOFILTER_OPTIONS } from './types.js'
export type { CuckooFilterOptions } from './types.js'
