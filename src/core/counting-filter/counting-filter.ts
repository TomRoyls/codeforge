import type { CountingFilterOptions, CountingFilterJSON, CountingFilterStats } from './types.js'
import { DEFAULT_COUNTING_FILTER_OPTIONS } from './types.js'

export class CountingFilter<T = string> {
  private counters: Uint8Array | Uint16Array
  private _counterCount: number
  private _hashCount: number
  private _expectedItems: number
  private _targetFPRate: number
  private _counterBits: 8 | 16
  private _size: number = 0
  private _capacity: number
  private _maxCounter: number

  constructor(expectedItems?: number, falsePositiveRate?: number)
  constructor(options?: Partial<CountingFilterOptions>)
  constructor(expectedItemsOrOptions?: number | Partial<CountingFilterOptions>, falsePositiveRate?: number) {
    let opts: CountingFilterOptions
    if (typeof expectedItemsOrOptions === 'object' && expectedItemsOrOptions !== null) {
      opts = { ...DEFAULT_COUNTING_FILTER_OPTIONS, ...expectedItemsOrOptions }
    } else {
      opts = {
        ...DEFAULT_COUNTING_FILTER_OPTIONS,
        ...(expectedItemsOrOptions !== undefined ? { expectedItems: expectedItemsOrOptions } : {}),
        ...(falsePositiveRate !== undefined ? { falsePositiveRate } : {}),
      }
    }
    this._expectedItems = opts.expectedItems
    this._targetFPRate = opts.falsePositiveRate
    this._counterBits = opts.counterBits ?? 8
    this._counterCount = this.calculateCounterCount(opts.expectedItems, opts.falsePositiveRate)
    this._hashCount = this.calculateHashCount(this._counterCount, opts.expectedItems)
    this._capacity = opts.expectedItems
    this._maxCounter = this._counterBits === 8 ? 255 : 65535
    this.counters = this._counterBits === 8
      ? new Uint8Array(this._counterCount)
      : new Uint16Array(this._counterCount)
  }

  insert(item: T): void {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    for (const pos of positions) {
      if (this.counters[pos]! < this._maxCounter) {
        this.counters[pos] = (this.counters[pos]! + 1) as number & (Uint8Array | Uint16Array)[number]
      }
    }
    this._size++
  }

  mayContain(item: T): boolean {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    for (const pos of positions) {
      if (this.counters[pos]! === 0) {
        return false
      }
    }
    return true
  }

  remove(item: T): boolean {
    if (!this.mayContain(item)) {
      return false
    }
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    for (const pos of positions) {
      if (this.counters[pos]! > 0) {
        this.counters[pos] = (this.counters[pos]! - 1) as number & (Uint8Array | Uint16Array)[number]
      }
    }
    this._size--
    return true
  }

  count(item: T): number {
    const key = this.serialize(item)
    const positions = this.getHashPositions(key)
    let minCount = this._maxCounter
    for (const pos of positions) {
      const c = this.counters[pos]!
      if (c < minCount) {
        minCount = c
      }
    }
    return minCount
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  falsePositiveRate(): number {
    if (this._size === 0) return 0
    return Math.pow(
      1 - Math.exp((-this._hashCount * this._size) / this._counterCount),
      this._hashCount,
    )
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.counters = this._counterBits === 8
      ? new Uint8Array(this._counterCount)
      : new Uint16Array(this._counterCount)
    this._size = 0
  }

  clone(): CountingFilter<T> {
    const cloned = new CountingFilter<T>({
      expectedItems: this._expectedItems,
      falsePositiveRate: this._targetFPRate,
      counterBits: this._counterBits,
    })
    if (this._counterBits === 8) {
      cloned.counters = new Uint8Array(this.counters as Uint8Array)
    } else {
      cloned.counters = new Uint16Array(this.counters as Uint16Array)
    }
    cloned._size = this._size
    return cloned
  }

  toJSON(): CountingFilterJSON {
    return {
      counters: Array.from(this.counters),
      counterCount: this._counterCount,
      hashCount: this._hashCount,
      expectedItems: this._expectedItems,
      targetFalsePositiveRate: this._targetFPRate,
      itemCount: this._size,
      counterBits: this._counterBits,
    }
  }

  static fromJSON<T = string>(data: CountingFilterJSON): CountingFilter<T> {
    const filter = new CountingFilter<T>({
      expectedItems: data.expectedItems,
      falsePositiveRate: data.targetFalsePositiveRate,
      counterBits: data.counterBits,
    })
    if (data.counterBits === 8) {
      filter.counters = new Uint8Array(data.counters)
    } else {
      filter.counters = new Uint16Array(data.counters)
    }
    filter._size = data.itemCount
    return filter
  }

  static from<T = string>(data: CountingFilterJSON): CountingFilter<T> {
    return CountingFilter.fromJSON<T>(data)
  }

  stats(): CountingFilterStats {
    let usedCounters = 0
    let maxCounter = 0
    let totalCounterValue = 0
    for (let i = 0; i < this._counterCount; i++) {
      const val = this.counters[i]!
      if (val > 0) usedCounters++
      if (val > maxCounter) maxCounter = val
      totalCounterValue += val
    }
    const fillRatio = this._counterCount > 0 ? usedCounters / this._counterCount : 0
    return {
      counterCount: this._counterCount,
      hashCount: this._hashCount,
      expectedItems: this._expectedItems,
      targetFalsePositiveRate: this._targetFPRate,
      size: this._size,
      capacity: this._capacity,
      falsePositiveRate: this.falsePositiveRate(),
      fillRatio,
      counterBits: this._counterBits,
      usedCounters,
      maxCounter,
    }
  }

  private calculateCounterCount(expectedItems: number, falsePositiveRate: number): number {
    return Math.ceil(-((expectedItems * Math.log(falsePositiveRate)) / Math.pow(Math.log(2), 2)))
  }

  private calculateHashCount(counterCount: number, expectedItems: number): number {
    return Math.max(1, Math.round((counterCount / expectedItems) * Math.log(2)))
  }

  private getHashPositions(key: string): number[] {
    const positions: number[] = []
    const hash1 = this.hash(key, 0)
    const hash2 = this.hash(key, hash1)
    for (let i = 0; i < this._hashCount; i++) {
      const combined = (hash1 + i * hash2) >>> 0
      positions.push(combined % this._counterCount)
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

export { DEFAULT_COUNTING_FILTER_OPTIONS } from './types.js'
export type { CountingFilterOptions, CountingFilterJSON, CountingFilterStats } from './types.js'
