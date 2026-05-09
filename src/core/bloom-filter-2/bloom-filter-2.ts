import type { CountingBloomFilterOptions } from './types.js'
import { DEFAULT_COUNTING_BLOOM_OPTIONS } from './types.js'

export class CountingBloomFilter {
  private counters: Uint32Array
  private numHashes: number

  constructor(options?: Partial<CountingBloomFilterOptions>) {
    const opts: CountingBloomFilterOptions = { ...DEFAULT_COUNTING_BLOOM_OPTIONS, ...options }
    const m = this.calculateSize(opts.expectedItems, opts.falsePositiveRate)
    this.numHashes = this.calculateHashCount(m, opts.expectedItems)
    this.counters = new Uint32Array(m)
  }

  add(item: string): void {
    const positions = this.getHashPositions(item)
    for (const pos of positions) {
      this.counters[pos] = this.counters[pos]! + 1
    }
  }

  remove(item: string): boolean {
    const positions = this.getHashPositions(item)
    for (const pos of positions) {
      if (this.counters[pos]! === 0) {
        return false
      }
    }
    for (const pos of positions) {
      this.counters[pos] = this.counters[pos]! - 1
    }
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
    let min = Infinity
    for (const pos of positions) {
      const c = this.counters[pos]!
      if (c < min) {
        min = c
      }
    }
    return min === Infinity ? 0 : min
  }

  merge(other: CountingBloomFilter): void {
    if (this.counters.length !== other.counters.length) {
      throw new Error('Cannot merge filters with different capacities')
    }
    if (this.numHashes !== other.numHashes) {
      throw new Error('Cannot merge filters with different hash counts')
    }
    for (let i = 0; i < this.counters.length; i++) {
      this.counters[i] = this.counters[i]! + other.counters[i]!
    }
  }

  reset(): void {
    this.counters = new Uint32Array(this.counters.length)
  }

  isEmpty(): boolean {
    for (let i = 0; i < this.counters.length; i++) {
      if (this.counters[i]! !== 0) {
        return false
      }
    }
    return true
  }

  estimatedSize(): number {
    const m = this.counters.length
    const k = this.numHashes
    const fr = this.fillRatio()
    if (fr === 0) return 0
    if (fr >= 1) {
      let total = 0
      for (let i = 0; i < m; i++) {
        total += this.counters[i]!
      }
      return Math.round(total / k)
    }
    return Math.round(-(m / k) * Math.log(1 - fr))
  }

  capacity(): number {
    return this.counters.length
  }

  hashCount(): number {
    return this.numHashes
  }

  fillRatio(): number {
    let nonZero = 0
    for (let i = 0; i < this.counters.length; i++) {
      if (this.counters[i]! > 0) {
        nonZero++
      }
    }
    return this.counters.length > 0 ? nonZero / this.counters.length : 0
  }

  private calculateSize(n: number, p: number): number {
    return Math.max(1, Math.ceil(-((n * Math.log(p)) / (Math.log(2) ** 2))))
  }

  private calculateHashCount(m: number, n: number): number {
    return Math.max(1, Math.round((m / n) * Math.log(2)))
  }

  private getHashPositions(item: string): number[] {
    const m = this.counters.length
    const positions: number[] = []
    const hash1 = this.hash(item, 0)
    const hash2 = this.hash(item, hash1)
    for (let i = 0; i < this.numHashes; i++) {
      const combined = (hash1 + i * hash2) >>> 0
      positions.push(combined % m)
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

export { DEFAULT_COUNTING_BLOOM_OPTIONS } from './types.js'
export type { CountingBloomFilterOptions } from './types.js'
