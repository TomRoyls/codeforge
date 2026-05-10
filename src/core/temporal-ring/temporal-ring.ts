import type { TemporalRingOptions, TemporalRingStatistics } from './types.js'
import { DEFAULT_TEMPORAL_RING_OPTIONS } from './types.js'

interface TimestampedEntry<T> {
  value: T
  timestamp: number
}

export class TemporalRing<T = unknown> {
  private buffer: (TimestampedEntry<T> | undefined)[]
  private head: number = 0
  private tail: number = 0
  private _size: number = 0
  private readonly _capacity: number
  private readonly _autoExpire: boolean
  private readonly _ttlMs: number
  private stats: TemporalRingStatistics = {
    pushes: 0,
    expirations: 0,
    queries: 0,
    totalExpired: 0,
    maxSeenSize: 0,
  }

  constructor(options?: TemporalRingOptions) {
    const opts = { ...DEFAULT_TEMPORAL_RING_OPTIONS, ...options }
    this._capacity = Math.max(1, opts.capacity)
    this._autoExpire = opts.autoExpire
    this._ttlMs = opts.ttlMs
    this.buffer = new Array<TimestampedEntry<T> | undefined>(this._capacity)
  }

  private toPhysicalIndex(logicalIndex: number): number {
    return (this.head + logicalIndex) % this._capacity
  }

  push(value: T, timestamp?: number): void {
    const ts = timestamp ?? Date.now()
    if (this._autoExpire && this._ttlMs > 0) {
      this.expireOlderThan(ts - this._ttlMs)
    }
    if (this._size === this._capacity) {
      this.buffer[this.head] = undefined
      this.head = (this.head + 1) % this._capacity
      this._size--
    }
    this.buffer[this.tail] = { value, timestamp: ts }
    this.tail = (this.tail + 1) % this._capacity
    this._size++
    this.stats.pushes++
    if (this._size > this.stats.maxSeenSize) {
      this.stats.maxSeenSize = this._size
    }
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    this.stats.queries++
    const entry = this.buffer[this.toPhysicalIndex(index)]
    return entry?.value
  }

  getRecent(windowMs: number, now?: number): T[] {
    const referenceTime = now ?? Date.now()
    const cutoff = referenceTime - windowMs
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const entry = this.buffer[this.toPhysicalIndex(i)]!
      if (entry.timestamp >= cutoff) {
        result.push(entry.value)
      }
    }
    this.stats.queries++
    return result
  }

  expireOlderThan(timestamp: number): number {
    let count = 0
    while (this._size > 0) {
      const entry = this.buffer[this.head]!
      if (entry.timestamp < timestamp) {
        this.buffer[this.head] = undefined
        this.head = (this.head + 1) % this._capacity
        this._size--
        count++
      } else {
        break
      }
    }
    if (count > 0) {
      this.stats.expirations++
      this.stats.totalExpired += count
    }
    return count
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this._size; i++) {
      this.buffer[this.toPhysicalIndex(i)] = undefined
    }
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const entry = this.buffer[this.toPhysicalIndex(i)]!
      result.push(entry.value)
    }
    return result
  }

  forEach(callback: (value: T, index: number, timestamp: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      const entry = this.buffer[this.toPhysicalIndex(i)]!
      callback(entry.value, i, entry.timestamp)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      const entry = this.buffer[this.toPhysicalIndex(i)]!
      yield entry.value
    }
  }

  oldest(): T | undefined {
    if (this._size === 0) return undefined
    this.stats.queries++
    return this.buffer[this.head]!.value
  }

  newest(): T | undefined {
    if (this._size === 0) return undefined
    this.stats.queries++
    return this.buffer[(this.tail - 1 + this._capacity) % this._capacity]!.value
  }

  timeSpan(): number {
    if (this._size < 2) return 0
    const oldestTs = this.buffer[this.head]!.timestamp
    const newestTs = this.buffer[(this.tail - 1 + this._capacity) % this._capacity]!.timestamp
    this.stats.queries++
    return newestTs - oldestTs
  }

  getInRange(start: number, end: number): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const entry = this.buffer[this.toPhysicalIndex(i)]!
      if (entry.timestamp >= start && entry.timestamp <= end) {
        result.push(entry.value)
      }
    }
    this.stats.queries++
    return result
  }

  countInRange(start: number, end: number): number {
    let count = 0
    for (let i = 0; i < this._size; i++) {
      const entry = this.buffer[this.toPhysicalIndex(i)]!
      if (entry.timestamp >= start && entry.timestamp <= end) {
        count++
      }
    }
    this.stats.queries++
    return count
  }

  getStatistics(): TemporalRingStatistics {
    return { ...this.stats }
  }
}

export { DEFAULT_TEMPORAL_RING_OPTIONS } from './types.js'
export type { TemporalRingOptions, TemporalRingStatistics } from './types.js'
