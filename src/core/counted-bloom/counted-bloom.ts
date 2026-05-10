import type { CountedBloomFilterOptions, CountedBloomFilterJSON, CountedBloomFilterStatistics } from './types.js'
import { DEFAULT_COUNTED_BLOOM_OPTIONS } from './types.js'

export class CountedBloomFilter<T = string> {
  private counters: Uint8Array | Uint16Array
  private _bucketCount: number
  private _hashCount: number
  private _expectedItems: number
  private _targetFPRate: number
  private _counterBits: number
  private _maxValue: number
  private _size: number = 0
  private _stats: CountedBloomFilterStatistics = {
    adds: 0,
    removes: 0,
    lookups: 0,
    overflows: 0,
    estimatedFalsePositives: 0,
  }

  constructor(expectedItems?: number, falsePositiveRate?: number, counterBits?: number)
  constructor(options?: Partial<CountedBloomFilterOptions>)
  constructor(
    expectedItemsOrOptions?: number | Partial<CountedBloomFilterOptions>,
    falsePositiveRate?: number,
    counterBits?: number,
  ) {
    let opts: Required<CountedBloomFilterOptions>
    if (typeof expectedItemsOrOptions === 'object' && expectedItemsOrOptions !== null) {
      opts = { ...DEFAULT_COUNTED_BLOOM_OPTIONS, ...expectedItemsOrOptions }
    } else {
      opts = {
        ...DEFAULT_COUNTED_BLOOM_OPTIONS,
        ...(expectedItemsOrOptions !== undefined ? { expectedItems: expectedItemsOrOptions } : {}),
        ...(falsePositiveRate !== undefined ? { falsePositiveRate } : {}),
        ...(counterBits !== undefined ? { counterBits } : {}),
      }
    }
    this._expectedItems = opts.expectedItems
    this._targetFPRate = opts.falsePositiveRate
    this._counterBits = opts.counterBits
    this._maxValue = (1 << opts.counterBits) - 1
    this._bucketCount = this.calculateBucketCount(opts.expectedItems, opts.falsePositiveRate)
    this._hashCount = this.calculateHashCount(this._bucketCount, opts.expectedItems)
    this.counters = this.createCounterArray(this._bucketCount)
  }

  add(item: T): void {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    for (const pos of positions) {
      if (this.counters[pos]! < this._maxValue) {
        this.counters[pos]!++
      } else {
        this._stats.overflows++
      }
    }
    this._size++
    this._stats.adds++
    this.updateEstimatedFPs()
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
      if (this.counters[pos]! > 0) {
        this.counters[pos]!--
      }
    }
    this._size--
    this._stats.removes++
    this.updateEstimatedFPs()
    return true
  }

  has(item: T): boolean {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    this._stats.lookups++
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
    this._stats.lookups++
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

  clear(): void {
    this.counters = this.createCounterArray(this._bucketCount)
    this._size = 0
    this._stats = {
      adds: 0,
      removes: 0,
      lookups: 0,
      overflows: 0,
      estimatedFalsePositives: 0,
    }
  }

  estimatedCount(): number {
    if (this._bucketCount === 0 || this._hashCount === 0) return 0
    const nonzero = this.countNonZero()
    if (nonzero === 0) return 0
    if (nonzero >= this._bucketCount) return this._size
    return Math.round(
      -(this._bucketCount / this._hashCount) * Math.log(1 - nonzero / this._bucketCount),
    )
  }

  capacity(): number {
    return this._expectedItems
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  falsePositiveRate(): number {
    if (this._size === 0) return 0
    return Math.pow(
      1 - Math.exp((-this._hashCount * this._size) / this._bucketCount),
      this._hashCount,
    )
  }

  fillRatio(): number {
    if (this._bucketCount === 0) return 0
    return this.countNonZero() / this._bucketCount
  }

  merge(other: CountedBloomFilter<T>): void {
    if (this._bucketCount !== other._bucketCount) {
      throw new Error('Cannot merge filters with different bucket counts')
    }
    if (this._hashCount !== other._hashCount) {
      throw new Error('Cannot merge filters with different hash counts')
    }
    if (this._counterBits !== other._counterBits) {
      throw new Error('Cannot merge filters with different counter sizes')
    }
    for (let i = 0; i < this._bucketCount; i++) {
      const sum = this.counters[i]! + other.counters[i]!
      this.counters[i] = Math.min(sum, this._maxValue) as (Uint8Array | Uint16Array)[number]
    }
    this._size += other._size
    this._stats.adds += other._stats.adds
    this._stats.removes += other._stats.removes
    this._stats.lookups += other._stats.lookups
    this._stats.overflows += other._stats.overflows
    this.updateEstimatedFPs()
  }

  toJSON(): CountedBloomFilterJSON {
    return {
      counters: Array.from(this.counters),
      counterBits: this._counterBits,
      bucketCount: this._bucketCount,
      hashCount: this._hashCount,
      expectedItems: this._expectedItems,
      targetFalsePositiveRate: this._targetFPRate,
      size: this._size,
      statistics: { ...this._stats },
    }
  }

  static fromJSON<T = string>(data: CountedBloomFilterJSON): CountedBloomFilter<T> {
    const filter = new CountedBloomFilter<T>({
      expectedItems: data.expectedItems,
      falsePositiveRate: data.targetFalsePositiveRate,
      counterBits: data.counterBits,
    })
    if (data.counterBits <= 8) {
      filter.counters = new Uint8Array(data.counters)
    } else {
      filter.counters = new Uint16Array(data.counters)
    }
    filter._size = data.size
    filter._stats = { ...data.statistics }
    return filter
  }

  getStatistics(): CountedBloomFilterStatistics {
    return { ...this._stats }
  }

  *[Symbol.iterator](): Iterator<{ position: number; count: number }> {
    for (let i = 0; i < this._bucketCount; i++) {
      if (this.counters[i]! > 0) {
        yield { position: i, count: this.counters[i]! }
      }
    }
  }

  private createCounterArray(size: number): Uint8Array | Uint16Array {
    if (this._counterBits <= 8) {
      return new Uint8Array(size)
    }
    return new Uint16Array(size)
  }

  private calculateBucketCount(expectedItems: number, falsePositiveRate: number): number {
    return Math.ceil(-((expectedItems * Math.log(falsePositiveRate)) / Math.pow(Math.log(2), 2)))
  }

  private calculateHashCount(bucketCount: number, expectedItems: number): number {
    return Math.max(1, Math.round((bucketCount / expectedItems) * Math.log(2)))
  }

  private getHashPositions(key: string): number[] {
    const positions: number[] = []
    const hash1 = this.hash(key, 0)
    const hash2 = this.hash(key, hash1)
    for (let i = 0; i < this._hashCount; i++) {
      const combined = (hash1 + i * hash2) >>> 0
      positions.push(combined % this._bucketCount)
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

  private countNonZero(): number {
    let count = 0
    for (let i = 0; i < this._bucketCount; i++) {
      if (this.counters[i]! > 0) count++
    }
    return count
  }

  private updateEstimatedFPs(): void {
    this._stats.estimatedFalsePositives = Math.round(
      this.falsePositiveRate() * this._stats.lookups,
    )
  }
}

export { DEFAULT_COUNTED_BLOOM_OPTIONS } from './types.js'
export type { CountedBloomFilterOptions, CountedBloomFilterJSON, CountedBloomFilterStatistics } from './types.js'
