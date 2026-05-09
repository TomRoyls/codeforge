import type { BloomFilterOptions, BloomFilterJSON } from './types.js'
import { DEFAULT_BLOOM_FILTER_OPTIONS } from './types.js'

export class BloomFilter<T = string> {
  private bitArray: Uint8Array
  private _bitCount: number
  private _hashCount: number
  private _expectedItems: number
  private _targetFPRate: number
  private _size: number = 0

  constructor(expectedItems?: number, falsePositiveRate?: number)
  constructor(options?: Partial<BloomFilterOptions>)
  constructor(expectedItemsOrOptions?: number | Partial<BloomFilterOptions>, falsePositiveRate?: number) {
    let opts: BloomFilterOptions
    if (typeof expectedItemsOrOptions === 'object' && expectedItemsOrOptions !== null) {
      opts = { ...DEFAULT_BLOOM_FILTER_OPTIONS, ...expectedItemsOrOptions }
    } else {
      opts = {
        ...DEFAULT_BLOOM_FILTER_OPTIONS,
        ...(expectedItemsOrOptions !== undefined ? { expectedItems: expectedItemsOrOptions } : {}),
        ...(falsePositiveRate !== undefined ? { falsePositiveRate } : {}),
      }
    }
    this._expectedItems = opts.expectedItems
    this._targetFPRate = opts.falsePositiveRate
    this._bitCount = this.calculateBitCount(opts.expectedItems, opts.falsePositiveRate)
    this._hashCount = this.calculateHashCount(this._bitCount, opts.expectedItems)
    this.bitArray = new Uint8Array(Math.ceil(this._bitCount / 8))
  }

  add(item: T): void {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    for (const pos of positions) {
      const byteIndex = Math.floor(pos / 8)
      const bitIndex = pos % 8
      this.bitArray[byteIndex] = this.bitArray[byteIndex]! | (1 << bitIndex)
    }
    this._size++
  }

  has(item: T): boolean {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    for (const pos of positions) {
      const byteIndex = Math.floor(pos / 8)
      const bitIndex = pos % 8
      if ((this.bitArray[byteIndex]! & (1 << bitIndex)) === 0) {
        return false
      }
    }
    return true
  }

  get size(): number {
    return this._size
  }

  get bitCount(): number {
    return this._bitCount
  }

  get hashCount(): number {
    return this._hashCount
  }

  falsePositiveRate(): number {
    if (this._size === 0) return 0
    return Math.pow(
      1 - Math.exp((-this._hashCount * this._size) / this._bitCount),
      this._hashCount,
    )
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  fillRatio(): number {
    let setBits = 0
    for (let i = 0; i < this._bitCount; i++) {
      const byteIndex = Math.floor(i / 8)
      const bitIndex = i % 8
      if ((this.bitArray[byteIndex]! & (1 << bitIndex)) !== 0) {
        setBits++
      }
    }
    return this._bitCount > 0 ? setBits / this._bitCount : 0
  }

  clear(): void {
    this.bitArray = new Uint8Array(this.bitArray.length)
    this._size = 0
  }

  clone(): BloomFilter<T> {
    const cloned = new BloomFilter<T>(this._expectedItems, this._targetFPRate)
    cloned.bitArray = new Uint8Array(this.bitArray)
    cloned._size = this._size
    return cloned
  }

  merge(other: BloomFilter<T>): void {
    if (this._bitCount !== other._bitCount) {
      throw new Error('Cannot merge bloom filters with different bit counts')
    }
    if (this._hashCount !== other._hashCount) {
      throw new Error('Cannot merge bloom filters with different hash counts')
    }
    for (let i = 0; i < this.bitArray.length; i++) {
      this.bitArray[i] = this.bitArray[i]! | other.bitArray[i]!
    }
    this._size = this._size + other._size
  }

  toJSON(): BloomFilterJSON {
    return {
      bitArray: Array.from(this.bitArray),
      bitCount: this._bitCount,
      hashCount: this._hashCount,
      expectedItems: this._expectedItems,
      targetFalsePositiveRate: this._targetFPRate,
      itemCount: this._size,
    }
  }

  static fromJSON<T = string>(data: BloomFilterJSON): BloomFilter<T> {
    const filter = new BloomFilter<T>(data.expectedItems, data.targetFalsePositiveRate)
    filter.bitArray = new Uint8Array(data.bitArray)
    filter._size = data.itemCount
    return filter
  }

  static create<T = string>(optimalFor: number, fpRate: number): BloomFilter<T> {
    return new BloomFilter<T>(optimalFor, fpRate)
  }

  private calculateBitCount(expectedItems: number, falsePositiveRate: number): number {
    return Math.ceil(-((expectedItems * Math.log(falsePositiveRate)) / Math.pow(Math.log(2), 2)))
  }

  private calculateHashCount(bitCount: number, expectedItems: number): number {
    return Math.max(1, Math.round((bitCount / expectedItems) * Math.log(2)))
  }

  private getHashPositions(key: string): number[] {
    const positions: number[] = []
    const hash1 = this.hash(key, 0)
    const hash2 = this.hash(key, hash1)
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
}

export { DEFAULT_BLOOM_FILTER_OPTIONS } from './types.js'
export type { BloomFilterOptions, BloomFilterJSON } from './types.js'
