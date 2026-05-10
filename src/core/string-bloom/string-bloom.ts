import type { StringBloomFilterOptions, StringBloomFilterStatistics, StringBloomFilterJSON } from './types.js'
import { DEFAULT_STRING_BLOOM_OPTIONS } from './types.js'

export class StringBloomFilter {
  private counters: Uint16Array
  private _bitCount: number
  private _hashCount: number
  private _expectedItems: number
  private _targetFPRate: number
  private _count: number = 0

  constructor(expectedItems?: number, falsePositiveRate?: number)
  constructor(options?: Partial<StringBloomFilterOptions>)
  constructor(expectedItemsOrOptions?: number | Partial<StringBloomFilterOptions>, falsePositiveRate?: number) {
    let opts: StringBloomFilterOptions
    if (typeof expectedItemsOrOptions === 'object' && expectedItemsOrOptions !== null) {
      opts = { ...DEFAULT_STRING_BLOOM_OPTIONS, ...expectedItemsOrOptions }
    } else {
      opts = {
        ...DEFAULT_STRING_BLOOM_OPTIONS,
        ...(expectedItemsOrOptions !== undefined ? { expectedItems: expectedItemsOrOptions } : {}),
        ...(falsePositiveRate !== undefined ? { falsePositiveRate } : {}),
      }
    }
    this._expectedItems = opts.expectedItems
    this._targetFPRate = opts.falsePositiveRate
    this._bitCount = this.calculateBitCount(opts.expectedItems, opts.falsePositiveRate)
    this._hashCount = this.calculateHashCount(this._bitCount, opts.expectedItems)
    this.counters = new Uint16Array(this._bitCount)
  }

  static create(expectedItems: number, falsePositiveRate: number): StringBloomFilter {
    return new StringBloomFilter(expectedItems, falsePositiveRate)
  }

  add(str: string): void {
    const positions = this.getHashPositions(str)
    for (const pos of positions) {
      if (this.counters[pos]! < 65535) {
        this.counters[pos]!++
      }
    }
    this._count++
  }

  has(str: string): boolean {
    const positions = this.getHashPositions(str)
    for (const pos of positions) {
      if (this.counters[pos]! === 0) {
        return false
      }
    }
    return true
  }

  remove(str: string): boolean {
    if (!this.has(str)) {
      return false
    }
    const positions = this.getHashPositions(str)
    for (const pos of positions) {
      if (this.counters[pos]! > 0) {
        this.counters[pos]!--
      }
    }
    this._count--
    return true
  }

  clear(): void {
    this.counters = new Uint16Array(this._bitCount)
    this._count = 0
  }

  estimatedSize(): number {
    return this._count
  }

  expectedFalsePositiveRate(): number {
    if (this._count === 0) return 0
    return Math.pow(
      1 - Math.exp((-this._hashCount * this._count) / this._bitCount),
      this._hashCount,
    )
  }

  fillRatio(): number {
    let setCounters = 0
    for (let i = 0; i < this._bitCount; i++) {
      if (this.counters[i]! > 0) {
        setCounters++
      }
    }
    return this._bitCount > 0 ? setCounters / this._bitCount : 0
  }

  capacity(): number {
    return this._expectedItems
  }

  get count(): number {
    return this._count
  }

  get isEmpty(): boolean {
    return this._count === 0
  }

  union(other: StringBloomFilter): StringBloomFilter {
    if (this._bitCount !== other._bitCount) {
      throw new Error('Cannot union bloom filters with different bit counts')
    }
    if (this._hashCount !== other._hashCount) {
      throw new Error('Cannot union bloom filters with different hash counts')
    }
    const result = new StringBloomFilter(this._expectedItems, this._targetFPRate)
    for (let i = 0; i < this._bitCount; i++) {
      result.counters[i] = Math.max(this.counters[i]!, other.counters[i]!)
    }
    result._count = this._count + other._count
    return result
  }

  intersection(other: StringBloomFilter): StringBloomFilter {
    if (this._bitCount !== other._bitCount) {
      throw new Error('Cannot intersect bloom filters with different bit counts')
    }
    if (this._hashCount !== other._hashCount) {
      throw new Error('Cannot intersect bloom filters with different hash counts')
    }
    const result = new StringBloomFilter(this._expectedItems, this._targetFPRate)
    for (let i = 0; i < this._bitCount; i++) {
      result.counters[i] = Math.min(this.counters[i]!, other.counters[i]!)
    }
    result._count = Math.min(this._count, other._count)
    return result
  }

  toJSON(): StringBloomFilterJSON {
    return {
      counters: Array.from(this.counters),
      bitCount: this._bitCount,
      hashCount: this._hashCount,
      expectedItems: this._expectedItems,
      targetFalsePositiveRate: this._targetFPRate,
      itemCount: this._count,
    }
  }

  static fromJSON(json: StringBloomFilterJSON): StringBloomFilter {
    const filter = new StringBloomFilter(json.expectedItems, json.targetFalsePositiveRate)
    filter.counters = new Uint16Array(json.counters)
    filter._count = json.itemCount
    return filter
  }

  getStatistics(): StringBloomFilterStatistics {
    return {
      estimatedSize: this.estimatedSize(),
      expectedFalsePositiveRate: this.expectedFalsePositiveRate(),
      fillRatio: this.fillRatio(),
      bitCount: this._bitCount,
      hashCount: this._hashCount,
      capacity: this._expectedItems,
      isEmpty: this._count === 0,
    }
  }

  *[Symbol.iterator](): Iterator<number> {
    for (let i = 0; i < this._bitCount; i++) {
      yield this.counters[i]!
    }
  }

  private calculateBitCount(expectedItems: number, falsePositiveRate: number): number {
    return Math.ceil(-((expectedItems * Math.log(falsePositiveRate)) / Math.pow(Math.log(2), 2)))
  }

  private calculateHashCount(bitCount: number, expectedItems: number): number {
    return Math.max(1, Math.round((bitCount / expectedItems) * Math.log(2)))
  }

  private getHashPositions(str: string): number[] {
    const positions: number[] = []
    const hash1 = this.hash(str, 0)
    const hash2 = this.hash(str, hash1)
    for (let i = 0; i < this._hashCount; i++) {
      const combined = (hash1 + i * hash2) >>> 0
      positions.push(combined % this._bitCount)
    }
    return positions
  }

  private hash(str: string, seed: number): number {
    let h1 = 0xdeadbeef ^ seed
    let h2 = 0x41c6ce57 ^ seed
    for (let i = 0; i < str.length; i++) {
      const ch = str.codePointAt(i)!
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0
  }
}

export { DEFAULT_STRING_BLOOM_OPTIONS } from './types.js'
export type { StringBloomFilterOptions, StringBloomFilterStatistics, StringBloomFilterJSON } from './types.js'
