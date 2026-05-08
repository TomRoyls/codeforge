import type { BloomFilterOptions, BloomFilterStats } from './types.js'
import { DEFAULT_BLOOM_FILTER_OPTIONS } from './types.js'

export class BloomFilter {
  private bitArray: Uint8Array
  private hashFunctionCount: number
  private expectedItems: number
  private falsePositiveRate: number
  private itemCount: number = 0

  constructor(options?: Partial<BloomFilterOptions>) {
    const opts: BloomFilterOptions = { ...DEFAULT_BLOOM_FILTER_OPTIONS, ...options }
    this.expectedItems = opts.expectedItems
    this.falsePositiveRate = opts.falsePositiveRate
    this.hashFunctionCount = opts.hashFunctions
    const bitSize = this.calculateBitArraySize(opts.expectedItems, opts.falsePositiveRate)
    this.bitArray = new Uint8Array(Math.ceil(bitSize / 8))
  }

  add(item: string): void {
    const positions = this.getHashPositions(item)
    for (const pos of positions) {
      const byteIndex = Math.floor(pos / 8)
      const bitIndex = pos % 8
      this.bitArray[byteIndex] = this.bitArray[byteIndex]! | (1 << bitIndex)
    }
    this.itemCount++
  }

  has(item: string): boolean {
    const positions = this.getHashPositions(item)
    for (const pos of positions) {
      const byteIndex = Math.floor(pos / 8)
      const bitIndex = pos % 8
      if ((this.bitArray[byteIndex]! & (1 << bitIndex)) === 0) {
        return false
      }
    }
    return true
  }

  addAll(items: string[]): void {
    for (const item of items) {
      this.add(item)
    }
  }

  hasAny(items: string[]): boolean {
    for (const item of items) {
      if (this.has(item)) {
        return true
      }
    }
    return false
  }

  hasAll(items: string[]): boolean {
    for (const item of items) {
      if (!this.has(item)) {
        return false
      }
    }
    return true
  }

  clear(): void {
    this.bitArray = new Uint8Array(this.bitArray.length)
    this.itemCount = 0
  }

  getStats(): BloomFilterStats {
    const totalBits = this.bitArray.length * 8
    let setBits = 0
    for (let i = 0; i < totalBits; i++) {
      const byteIndex = Math.floor(i / 8)
      const bitIndex = i % 8
      if ((this.bitArray[byteIndex]! & (1 << bitIndex)) !== 0) {
        setBits++
      }
    }
    const fillRatio = totalBits > 0 ? setBits / totalBits : 0
    const estimatedFP = Math.pow(1 - Math.exp(-this.hashFunctionCount * this.itemCount / totalBits), this.hashFunctionCount)
    return {
      bitArraySize: totalBits,
      hashFunctionCount: this.hashFunctionCount,
      expectedItems: this.expectedItems,
      falsePositiveRate: this.falsePositiveRate,
      itemCount: this.itemCount,
      fillRatio,
      estimatedFalsePositiveRate: estimatedFP,
    }
  }

  getFillRatio(): number {
    return this.getStats().fillRatio
  }

  getItemCount(): number {
    return this.itemCount
  }

  isEmpty(): boolean {
    return this.itemCount === 0
  }

  getBitArray(): Uint8Array {
    return new Uint8Array(this.bitArray)
  }

  toJSON(): Record<string, unknown> {
    return {
      bitArray: Array.from(this.bitArray),
      hashFunctionCount: this.hashFunctionCount,
      expectedItems: this.expectedItems,
      falsePositiveRate: this.falsePositiveRate,
      itemCount: this.itemCount,
    }
  }

  static fromJSON(data: Record<string, unknown>): BloomFilter {
    const filter = new BloomFilter({
      expectedItems: data.expectedItems as number,
      falsePositiveRate: data.falsePositiveRate as number,
      hashFunctions: data.hashFunctionCount as number,
    })
    filter.bitArray = new Uint8Array(data.bitArray as number[])
    filter.itemCount = data.itemCount as number
    return filter
  }

  private calculateBitArraySize(expectedItems: number, falsePositiveRate: number): number {
    return Math.ceil(-((expectedItems * Math.log(falsePositiveRate)) / Math.pow(Math.log(2), 2)))
  }

  private getHashPositions(item: string): number[] {
    const totalBits = this.bitArray.length * 8
    const positions: number[] = []
    const hash1 = this.hash(item, 0)
    const hash2 = this.hash(item, hash1)
    for (let i = 0; i < this.hashFunctionCount; i++) {
      const combined = (hash1 + i * hash2) >>> 0
      positions.push(combined % totalBits)
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
}

export { DEFAULT_BLOOM_FILTER_OPTIONS } from './types.js'
export type { BloomFilterOptions, BloomFilterStats } from './types.js'
