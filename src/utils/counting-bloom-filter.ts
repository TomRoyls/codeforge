export interface CountingBloomFilterStats {
  capacity: number
  size: number
  counterCount: number
  hashCount: number
  falsePositiveRate: number
}

import { hash64 } from './hash-utils.js';

export class CountingBloomFilter {
  private counters: Uint16Array
  private readonly _counterCount: number
  private readonly _hashCount: number = 4
  private readonly _capacity: number
  private _size: number = 0

  constructor(capacity: number, falsePositiveRate: number = 0.01) {
    if (capacity < 1) throw new RangeError(`Capacity must be >= 1, got ${capacity}`)
    if (falsePositiveRate <= 0 || falsePositiveRate >= 1) {
      throw new RangeError(`False positive rate must be in (0, 1), got ${falsePositiveRate}`)
    }
    this._capacity = capacity
    this._counterCount = Math.max(64, Math.ceil(-((capacity * Math.log(falsePositiveRate)) / (Math.LN2 * Math.LN2))))
    this.counters = new Uint16Array(this._counterCount)
  }

  add(value: string): void {
    const positions = this.getPositions(value)
    for (const pos of positions) {
      if (this.counters[pos]! < 65535) {
        this.counters[pos]!++
      }
    }
    this._size++
  }

  remove(value: string): boolean {
    const positions = this.getPositions(value)
    for (const pos of positions) {
      if (this.counters[pos]! === 0) return false
    }
    for (const pos of positions) {
      this.counters[pos]!--
    }
    this._size--
    return true
  }

  has(value: string): boolean {
    const positions = this.getPositions(value)
    for (const pos of positions) {
      if (this.counters[pos]! === 0) return false
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
    this.counters.fill(0)
    this._size = 0
  }

  get falsePositiveRate(): number {
    if (this._size === 0) return 0
    return Math.pow(1 - Math.exp(-this._hashCount * this._size / this._counterCount), this._hashCount)
  }

  stats(): CountingBloomFilterStats {
    return {
      capacity: this._capacity,
      size: this._size,
      counterCount: this._counterCount,
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
      positions.push(combined % this._counterCount)
    }
    return positions
  }

  private hash = hash64;
}
