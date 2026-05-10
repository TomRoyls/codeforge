import type { BlockedBloomFilterOptions, BlockedBloomFilterJSON, BlockedBloomFilterStatistics } from './types.js'
import { DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS } from './types.js'

export class BlockedBloomFilter<T = string> {
  private blocks: Uint8Array[]
  private _blockSize: number
  private _blockCount: number
  private _hashCount: number
  private _expectedItems: number
  private _targetFPRate: number
  private _size: number = 0
  private _stats: BlockedBloomFilterStatistics

  constructor(expectedItems?: number, falsePositiveRate?: number, blockSize?: number)
  constructor(options?: Partial<BlockedBloomFilterOptions>)
  constructor(
    expectedItemsOrOptions?: number | Partial<BlockedBloomFilterOptions>,
    falsePositiveRate?: number,
    blockSize?: number,
  ) {
    let opts: BlockedBloomFilterOptions
    if (typeof expectedItemsOrOptions === 'object' && expectedItemsOrOptions !== null) {
      opts = { ...DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS, ...expectedItemsOrOptions }
    } else {
      opts = {
        ...DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS,
        ...(expectedItemsOrOptions !== undefined ? { expectedItems: expectedItemsOrOptions } : {}),
        ...(falsePositiveRate !== undefined ? { falsePositiveRate } : {}),
        ...(blockSize !== undefined ? { blockSize } : {}),
      }
    }
    this._expectedItems = opts.expectedItems
    this._targetFPRate = opts.falsePositiveRate
    this._blockSize = opts.blockSize
    const totalBits = this.calculateBitCount(opts.expectedItems, opts.falsePositiveRate)
    this._blockCount = Math.max(1, Math.ceil(totalBits / this._blockSize))
    this._hashCount = this.calculateHashCount(this._blockSize, opts.expectedItems / this._blockCount)
    this.blocks = []
    const bytesPerBlock = Math.ceil(this._blockSize / 8)
    for (let i = 0; i < this._blockCount; i++) {
      this.blocks.push(new Uint8Array(bytesPerBlock))
    }
    this._stats = {
      adds: 0,
      lookups: 0,
      blocks: 0,
      hashComputations: 0,
      estimatedFalsePositives: 0,
    }
  }

  add(item: T): void {
    const key = this.serialize(item)
    const blockIndex = this.getBlockIndex(key)
    const block = this.blocks[blockIndex]!
    const positions = this.getBlockPositions(key, blockIndex)
    this._stats.adds++
    this._stats.hashComputations += this._hashCount
    this._stats.blocks++
    for (const pos of positions) {
      const byteIndex = Math.floor(pos / 8)
      const bitIndex = pos % 8
      block[byteIndex] = block[byteIndex]! | (1 << bitIndex)
    }
    this._size++
  }

  has(item: T): boolean {
    const key = this.serialize(item)
    const blockIndex = this.getBlockIndex(key)
    const block = this.blocks[blockIndex]!
    const positions = this.getBlockPositions(key, blockIndex)
    this._stats.lookups++
    this._stats.hashComputations += this._hashCount
    this._stats.blocks++
    for (const pos of positions) {
      const byteIndex = Math.floor(pos / 8)
      const bitIndex = pos % 8
      if ((block[byteIndex]! & (1 << bitIndex)) === 0) {
        return false
      }
    }
    this._stats.estimatedFalsePositives++
    return true
  }

  clear(): void {
    const bytesPerBlock = Math.ceil(this._blockSize / 8)
    for (let i = 0; i < this._blockCount; i++) {
      this.blocks[i] = new Uint8Array(bytesPerBlock)
    }
    this._size = 0
    this._stats.adds = 0
    this._stats.lookups = 0
    this._stats.blocks = 0
    this._stats.hashComputations = 0
    this._stats.estimatedFalsePositives = 0
  }

  estimatedFillRatio(): number {
    let setBits = 0
    for (let b = 0; b < this._blockCount; b++) {
      const block = this.blocks[b]!
      for (let i = 0; i < this._blockSize; i++) {
        const byteIndex = Math.floor(i / 8)
        const bitIndex = i % 8
        if (byteIndex < block.length && (block[byteIndex]! & (1 << bitIndex)) !== 0) {
          setBits++
        }
      }
    }
    const totalBits = this._blockCount * this._blockSize
    return totalBits > 0 ? setBits / totalBits : 0
  }

  expectedFalsePositiveRate(): number {
    if (this._size === 0) return 0
    const itemsPerBlock = this._size / this._blockCount
    return Math.pow(
      1 - Math.exp((-this._hashCount * itemsPerBlock) / this._blockSize),
      this._hashCount,
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

  bitSize(): number {
    return this._blockCount * this._blockSize
  }

  blockCount(): number {
    return this._blockCount
  }

  union(other: BlockedBloomFilter<T>): BlockedBloomFilter<T> {
    if (this._blockSize !== other._blockSize) {
      throw new Error('Cannot union filters with different block sizes')
    }
    if (this._blockCount !== other._blockCount) {
      throw new Error('Cannot union filters with different block counts')
    }
    const result = new BlockedBloomFilter<T>({
      expectedItems: this._expectedItems,
      falsePositiveRate: this._targetFPRate,
      blockSize: this._blockSize,
    })
    for (let i = 0; i < this._blockCount; i++) {
      const aBlock = this.blocks[i]!
      const bBlock = other.blocks[i]!
      const rBlock = result.blocks[i]!
      for (let j = 0; j < aBlock.length; j++) {
        rBlock[j] = aBlock[j]! | bBlock[j]!
      }
    }
    result._size = Math.max(this._size, other._size)
    return result
  }

  intersection(other: BlockedBloomFilter<T>): BlockedBloomFilter<T> {
    if (this._blockSize !== other._blockSize) {
      throw new Error('Cannot intersect filters with different block sizes')
    }
    if (this._blockCount !== other._blockCount) {
      throw new Error('Cannot intersect filters with different block counts')
    }
    const result = new BlockedBloomFilter<T>({
      expectedItems: this._expectedItems,
      falsePositiveRate: this._targetFPRate,
      blockSize: this._blockSize,
    })
    for (let i = 0; i < this._blockCount; i++) {
      const aBlock = this.blocks[i]!
      const bBlock = other.blocks[i]!
      const rBlock = result.blocks[i]!
      for (let j = 0; j < aBlock.length; j++) {
        rBlock[j] = aBlock[j]! & bBlock[j]!
      }
    }
    result._size = Math.min(this._size, other._size)
    return result
  }

  toJSON(): BlockedBloomFilterJSON {
    return {
      blocks: this.blocks.map((block) => Array.from(block)),
      blockSize: this._blockSize,
      blockCount: this._blockCount,
      hashCount: this._hashCount,
      expectedItems: this._expectedItems,
      targetFalsePositiveRate: this._targetFPRate,
      itemCount: this._size,
      statistics: { ...this._stats },
    }
  }

  static fromJSON<T = string>(data: BlockedBloomFilterJSON): BlockedBloomFilter<T> {
    const filter = new BlockedBloomFilter<T>({
      expectedItems: data.expectedItems,
      falsePositiveRate: data.targetFalsePositiveRate,
      blockSize: data.blockSize,
    })
    for (let i = 0; i < data.blocks.length; i++) {
      filter.blocks[i] = new Uint8Array(data.blocks[i]!)
    }
    filter._size = data.itemCount
    filter._stats = { ...data.statistics }
    return filter
  }

  getStatistics(): BlockedBloomFilterStatistics {
    return { ...this._stats }
  }

  *[Symbol.iterator](): Generator<T, void, unknown> {
  }

  private calculateBitCount(expectedItems: number, falsePositiveRate: number): number {
    return Math.ceil(-((expectedItems * Math.log(falsePositiveRate)) / Math.pow(Math.log(2), 2)))
  }

  private calculateHashCount(blockSize: number, itemsPerBlock: number): number {
    if (itemsPerBlock <= 0) return Math.max(1, Math.round((blockSize / 1) * Math.log(2)))
    return Math.max(1, Math.round((blockSize / itemsPerBlock) * Math.log(2)))
  }

  private getBlockIndex(key: string): number {
    const hash = this.hash(key, 0x9e3779b9)
    return hash % this._blockCount
  }

  private getBlockPositions(key: string, blockIndex: number): number[] {
    const positions: number[] = []
    const hash1 = this.hash(key, blockIndex + 1)
    const hash2 = this.hash(key, hash1)
    for (let i = 0; i < this._hashCount; i++) {
      const combined = (hash1 + i * hash2) >>> 0
      positions.push(combined % this._blockSize)
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

export { DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS } from './types.js'
export type { BlockedBloomFilterOptions, BlockedBloomFilterJSON, BlockedBloomFilterStatistics } from './types.js'
