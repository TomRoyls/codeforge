export interface SimpleBloomFilterStats {
  capacity: number
  size: number
  bitCount: number
  hashCount: number
  falsePositiveRate: number
}

import { hash64 } from './hash-utils.js';

export class SimpleBloomFilter {
  private bits: Uint8Array
  private readonly _bitCount: number
  private readonly _hashCount: number
  private readonly _capacity: number
  private _size: number = 0

  constructor(capacity: number, falsePositiveRate: number = 0.01) {
    if (capacity < 1) throw new RangeError(`Capacity must be >= 1, got ${capacity}`)
    if (falsePositiveRate <= 0 || falsePositiveRate >= 1) {
      throw new RangeError(`False positive rate must be in (0, 1), got ${falsePositiveRate}`)
    }
    this._capacity = capacity
    this._bitCount = Math.max(64, Math.ceil(-((capacity * Math.log(falsePositiveRate)) / (Math.LN2 * Math.LN2))))
    this._hashCount = Math.max(1, Math.round((this._bitCount / capacity) * Math.LN2))
    this.bits = new Uint8Array(this._bitCount)
  }

  add(value: string): void {
    const positions = this.getPositions(value)
    for (const pos of positions) {
      this.bits[pos] = 1
    }
    this._size++
  }

  has(value: string): boolean {
    const positions = this.getPositions(value)
    for (const pos of positions) {
      if (this.bits[pos] === 0) return false
    }
    return true
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.bits.fill(0)
    this._size = 0
  }

  get falsePositiveRate(): number {
    if (this._size === 0) return 0
    return Math.pow(1 - Math.exp(-this._hashCount * this._size / this._bitCount), this._hashCount)
  }

  stats(): SimpleBloomFilterStats {
    return {
      capacity: this._capacity,
      size: this._size,
      bitCount: this._bitCount,
      hashCount: this._hashCount,
      falsePositiveRate: this.falsePositiveRate,
    }
  }

  private getPositions(value: string): number[] {
    const positions: number[] = []
    const h1 = this.hash(value, 0)
    const h2 = this.hash(value, h1)
    for (let i = 0; i < this._hashCount; i++) {
      const combined = (h1 + i * h2) >>> 0
      positions.push(combined % this._bitCount)
    }
    return positions
  }

  private hash = hash64;
}
