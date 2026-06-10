import { DEFAULT_ERROR_RATE } from './types.js'

export class CountingBloomFilter {
  private counters: Uint16Array
  private hashFunctionCount: number
  private _capacity: number
  private errorRate: number
  private _size: number = 0
  private bucketCount: number

  constructor(capacity: number, errorRate: number = DEFAULT_ERROR_RATE) {
    if (capacity < 1) throw new RangeError('capacity must be >= 1')

    this._capacity = capacity
    this.errorRate = errorRate
    this.bucketCount = this.calculateBucketCount(capacity, errorRate)
    this.hashFunctionCount = this.calculateHashCount(this.bucketCount, capacity)
    this.counters = new Uint16Array(this.bucketCount)
  }

  add(item: string): void {
    const positions = this.getHashPositions(item)
    for (const pos of positions) {
      if (this.counters[pos]! < 65535) {
        this.counters[pos]!++
      }
    }
    this._size++
  }

  remove(item: string): boolean {
    if (!this.has(item)) {
      return false
    }
    const positions = this.getHashPositions(item)
    for (const pos of positions) {
      if (this.counters[pos]! > 0) {
        this.counters[pos]!--
      }
    }
    this._size--
    return true
  }

  has(item: string): boolean {
    const positions = this.getHashPositions(item)
    for (const pos of positions) {
      if (this.counters[pos]! === 0) {
        return false
      }
    }
    return true
  }

  count(item: string): number {
    const positions = this.getHashPositions(item)
    let minCount = Infinity
    for (const pos of positions) {
      if (this.counters[pos]! === 0) {
        return 0
      }
      if (this.counters[pos]! < minCount) {
        minCount = this.counters[pos]!
      }
    }
    return minCount === Infinity ? 0 : minCount
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.counters = new Uint16Array(this.bucketCount)
    this._size = 0
  }

  clone(): CountingBloomFilter {
    const cloned = new CountingBloomFilter(this._capacity, this.errorRate)
    cloned.counters = new Uint16Array(this.counters)
    cloned._size = this._size
    return cloned
  }

  equals(other: CountingBloomFilter): boolean {
    if (this._capacity !== other._capacity) return false
    if (this.errorRate !== other.errorRate) return false
    if (this._size !== other._size) return false
    if (this.bucketCount !== other.bucketCount) return false
    if (this.hashFunctionCount !== other.hashFunctionCount) return false
    for (let i = 0; i < this.bucketCount; i++) {
      if (this.counters[i] !== other.counters[i]) return false
    }
    return true
  }

  expectedFalsePositiveRate(): number {
    let filledBuckets = 0
    for (let i = 0; i < this.bucketCount; i++) {
      if (this.counters[i]! > 0) {
        filledBuckets++
      }
    }
    const ratio = filledBuckets / this.bucketCount
    return Math.pow(ratio, this.hashFunctionCount)
  }

  union(other: CountingBloomFilter): CountingBloomFilter {
    if (this._capacity !== other._capacity || this.errorRate !== other.errorRate) {
      throw new Error('Cannot union filters with different capacities or error rates')
    }
    const result = new CountingBloomFilter(this._capacity, this.errorRate)
    for (let i = 0; i < this.bucketCount; i++) {
      result.counters[i] = Math.max(this.counters[i]!, other.counters[i]!)
    }
    result._size = Math.max(this._size, other._size)
    return result
  }

  intersection(other: CountingBloomFilter): CountingBloomFilter {
    if (this._capacity !== other._capacity || this.errorRate !== other.errorRate) {
      throw new Error('Cannot intersect filters with different capacities or error rates')
    }
    const result = new CountingBloomFilter(this._capacity, this.errorRate)
    for (let i = 0; i < this.bucketCount; i++) {
      result.counters[i] = Math.min(this.counters[i]!, other.counters[i]!)
    }
    result._size = Math.min(this._size, other._size)
    return result
  }

  get capacity(): number {
    return this._capacity
  }

  get loadFactor(): number {
    let filledBuckets = 0
    for (let i = 0; i < this.bucketCount; i++) {
      if (this.counters[i]! > 0) {
        filledBuckets++
      }
    }
    return filledBuckets / this.bucketCount
  }

  getBucketCount(): number {
    return this.bucketCount
  }

  getHashFunctionCount(): number {
    return this.hashFunctionCount
  }

  getErrorRate(): number {
    return this.errorRate
  }

  static from(items: string[], capacity?: number, errorRate?: number): CountingBloomFilter {
    const cap = capacity ?? Math.max(items.length * 2, 100)
    const filter = new CountingBloomFilter(cap, errorRate)
    for (const item of items) {
      filter.add(item)
    }
    return filter
  }

  private calculateBucketCount(capacity: number, errorRate: number): number {
    return Math.ceil(-((capacity * Math.log(errorRate)) / Math.pow(Math.log(2), 2)))
  }

  private calculateHashCount(bucketCount: number, capacity: number): number {
    return Math.max(1, Math.round((bucketCount / capacity) * Math.log(2)))
  }

  private getHashPositions(item: string): number[] {
    const positions: number[] = []
    const hash1 = this.hash(item, 0)
    const hash2 = this.hash(item, hash1)
    for (let i = 0; i < this.hashFunctionCount; i++) {
      const combined = (hash1 + i * hash2) >>> 0
      positions.push(combined % this.bucketCount)
    }
    return positions
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

  toString(): string {
    return `${CountingBloomFilter}({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'CountingBloomFilter'
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}

export { DEFAULT_ERROR_RATE } from './types.js'
