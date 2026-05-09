import type { CountingBloomFilterOptions } from './types.js'
import { DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS } from './types.js'

export class CountingBloomFilter {
  private counters: Uint16Array
  private hashFunctionCount: number
  private filterCapacity: number
  private filterErrorRate: number
  private itemCount: number = 0
  private bitSize: number

  constructor(options?: Partial<CountingBloomFilterOptions>) {
    const opts: CountingBloomFilterOptions = { ...DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS, ...options }
    this.filterCapacity = opts.capacity
    this.filterErrorRate = opts.errorRate
    this.bitSize = this.calculateBitArraySize(opts.capacity, opts.errorRate)
    this.hashFunctionCount = this.calculateHashCount(this.bitSize, opts.capacity)
    this.counters = new Uint16Array(this.bitSize)
  }

  add(item: string): void {
    const positions = this.getHashPositions(item)
    for (const pos of positions) {
      if (this.counters[pos]! < 65535) {
        this.counters[pos]!++
      }
    }
    this.itemCount++
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
    this.itemCount--
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

  mightHave(item: string): boolean {
    return this.has(item)
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

  getEstimatedCount(item: string): number {
    return this.count(item)
  }

  size(): number {
    return this.itemCount
  }

  isEmpty(): boolean {
    return this.itemCount === 0
  }

  clear(): void {
    this.counters = new Uint16Array(this.bitSize)
    this.itemCount = 0
  }

  getCapacity(): number {
    return this.filterCapacity
  }

  getErrorRate(): number {
    return this.filterErrorRate
  }

  getBitCount(): number {
    return this.bitSize
  }

  getHashCount(): number {
    return this.hashFunctionCount
  }

  clone(): CountingBloomFilter {
    const cloned = new CountingBloomFilter({
      capacity: this.filterCapacity,
      errorRate: this.filterErrorRate,
    })
    cloned.counters = new Uint16Array(this.counters)
    cloned.itemCount = this.itemCount
    return cloned
  }

  static fromItems(items: string[], options?: Partial<CountingBloomFilterOptions>): CountingBloomFilter {
    const capacity = options?.capacity ?? Math.max(items.length, DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS.capacity)
    const filter = new CountingBloomFilter({ ...options, capacity })
    for (const item of items) {
      filter.add(item)
    }
    return filter
  }

  private calculateBitArraySize(capacity: number, errorRate: number): number {
    return Math.ceil(-((capacity * Math.log(errorRate)) / Math.pow(Math.log(2), 2)))
  }

  private calculateHashCount(bitSize: number, capacity: number): number {
    return Math.max(1, Math.round((bitSize / capacity) * Math.log(2)))
  }

  private getHashPositions(item: string): number[] {
    const positions: number[] = []
    const hash1 = this.hash(item, 0)
    const hash2 = this.hash(item, hash1)
    for (let i = 0; i < this.hashFunctionCount; i++) {
      const combined = (hash1 + i * hash2) >>> 0
      positions.push(combined % this.bitSize)
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

export { DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS } from './types.js'
export type { CountingBloomFilterOptions } from './types.js'
