import type { CountingBloomFilterOptions } from './types.js'

export class CountingBloomFilter<T = string> {
  private counters: Uint32Array
  private _numCounters: number
  private _numHashes: number
  private _expectedItems: number
  private _errorRate: number
  private _size: number

  constructor(options?: CountingBloomFilterOptions) {
    const expectedItems = options?.expectedItems ?? 100
    const errorRate = options?.errorRate ?? 0.01

    this._expectedItems = expectedItems
    this._errorRate = errorRate
    this._size = 0

    this._numCounters = Math.ceil(
      -((expectedItems * Math.log(errorRate)) / Math.pow(Math.log(2), 2)),
    )
    this._numHashes = Math.max(
      1,
      Math.round((this._numCounters / expectedItems) * Math.log(2)),
    )

    if (options?.hashFunctions !== undefined && options.hashFunctions > 0) {
      this._numHashes = options.hashFunctions
    }

    this.counters = new Uint32Array(this._numCounters)
  }

  add(item: T): void {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    for (const pos of positions) {
      this.counters[pos]!++
    }
    this._size++
  }

  remove(item: T): boolean {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    for (const pos of positions) {
      if (this.counters[pos]! === 0) {
        return false
      }
    }
    for (const pos of positions) {
      this.counters[pos]!--
    }
    this._size--
    return true
  }

  has(item: T): boolean {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    for (const pos of positions) {
      if (this.counters[pos]! === 0) {
        return false
      }
    }
    return true
  }

  count(item: T): number {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
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

  update(item: T, delta: number): void {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    for (const pos of positions) {
      this.counters[pos] = Math.max(0, this.counters[pos]! + delta)
    }
    if (delta > 0) {
      this._size += delta
    }
  }

  expectedFalsePositiveRate(): number {
    if (this._size === 0 || this._numCounters === 0) return 0
    return Math.pow(
      1 - Math.exp((-this._numHashes * this._size) / this._numCounters),
      this._numHashes,
    )
  }

  fillRatio(): number {
    if (this._numCounters === 0) return 0
    let nonZero = 0
    for (let i = 0; i < this._numCounters; i++) {
      if (this.counters[i]! > 0) nonZero++
    }
    return nonZero / this._numCounters
  }

  get capacity(): number {
    return this._expectedItems
  }

  get size(): number {
    return this._size
  }

  get numHashes(): number {
    return this._numHashes
  }

  get numCounters(): number {
    return this._numCounters
  }

  clear(): void {
    this.counters = new Uint32Array(this._numCounters)
    this._size = 0
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clone(): CountingBloomFilter<T> {
    const cloned = new CountingBloomFilter<T>({
      expectedItems: this._expectedItems,
      errorRate: this._errorRate,
      hashFunctions: this._numHashes,
    })
    cloned.counters = new Uint32Array(this.counters)
    cloned._size = this._size
    return cloned
  }

  merge(other: CountingBloomFilter<T>): CountingBloomFilter<T> {
    if (this._numCounters !== other._numCounters) {
      throw new Error('Cannot merge filters with different number of counters')
    }
    if (this._numHashes !== other._numHashes) {
      throw new Error('Cannot merge filters with different number of hash functions')
    }
    const result = this.clone()
    for (let i = 0; i < result._numCounters; i++) {
      result.counters[i] = this.counters[i]! + other.counters[i]!
    }
    result._size = this._size + other._size
    return result
  }

  equals(other: CountingBloomFilter<T>): boolean {
    if (this._numCounters !== other._numCounters) return false
    if (this._numHashes !== other._numHashes) return false
    for (let i = 0; i < this._numCounters; i++) {
      if (this.counters[i] !== other.counters[i]) return false
    }
    return true
  }

  private getHashPositions(key: string): number[] {
    const positions: number[] = []
    const hash1 = this.hash(key, 0)
    const hash2 = this.hash(key, hash1)
    for (let i = 0; i < this._numHashes; i++) {
      const combined = (hash1 + i * hash2) >>> 0
      positions.push(combined % this._numCounters)
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

  private serialize(item: T): string {
    return JSON.stringify(item)
  }

  toString(): string {
    return `${CountingBloomFilter}({ size: ${this.size} })`
  }

  static empty<T>(): CountingBloomFilter<T> {
    return new CountingBloomFilter<T>()
  }

  get [Symbol.toStringTag](): string {
    return 'CountingBloomFilter'
  }
}

export type { CountingBloomFilterOptions } from './types.js'
