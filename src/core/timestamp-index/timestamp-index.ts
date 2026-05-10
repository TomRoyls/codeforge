import type {
  TimestampIndexOptions,
  TimestampIndexStatistics,
} from './types.js'
import { DEFAULT_TIMESTAMP_INDEX_OPTIONS } from './types.js'

interface TimestampEntry<V> {
  timestamp: number
  value: V
}

export class TimestampIndex<V> {
  private _entries: TimestampEntry<V>[] = []
  private _options: TimestampIndexOptions
  private _stats: TimestampIndexStatistics = {
    inserts: 0,
    deletes: 0,
    rangeQueries: 0,
    expirations: 0,
    lookups: 0,
  }

  constructor(options?: Partial<TimestampIndexOptions>) {
    this._options = { ...DEFAULT_TIMESTAMP_INDEX_OPTIONS, ...options }
  }

  private _findIndex(timestamp: number): number {
    let lo = 0
    let hi = this._entries.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const midTs = this._entries[mid]!.timestamp
      if (midTs === timestamp) return mid
      if (midTs < timestamp) lo = mid + 1
      else hi = mid - 1
    }
    return -1
  }

  private _findInsertPos(timestamp: number): number {
    let lo = 0
    let hi = this._entries.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this._entries[mid]!.timestamp < timestamp) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  private _findFirstGreaterEqual(timestamp: number): number {
    let lo = 0
    let hi = this._entries.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this._entries[mid]!.timestamp < timestamp) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  private _findFirstGreater(timestamp: number): number {
    let lo = 0
    let hi = this._entries.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this._entries[mid]!.timestamp <= timestamp) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  insert(timestamp: number, value: V): boolean {
    const existingIdx = this._findIndex(timestamp)
    if (existingIdx !== -1) {
      if (!this._options.allowOverwrite) return false
      this._entries[existingIdx]!.value = value
      this._stats.inserts++
      return true
    }
    const pos = this._findInsertPos(timestamp)
    this._entries.splice(pos, 0, { timestamp, value })
    this._stats.inserts++
    return true
  }

  get(timestamp: number): V | undefined {
    this._stats.lookups++
    const idx = this._findIndex(timestamp)
    if (idx === -1) return undefined
    return this._entries[idx]!.value
  }

  getByRange(start: number, end: number): V[] {
    this._stats.rangeQueries++
    const from = this._findFirstGreaterEqual(start)
    const to = this._findFirstGreater(end)
    const result: V[] = []
    for (let i = from; i < to; i++) {
      result.push(this._entries[i]!.value)
    }
    return result
  }

  delete(timestamp: number): boolean {
    const idx = this._findIndex(timestamp)
    if (idx === -1) return false
    this._entries.splice(idx, 1)
    this._stats.deletes++
    return true
  }

  deleteByRange(start: number, end: number): number {
    this._stats.rangeQueries++
    if (start > end) return 0
    const from = this._findFirstGreaterEqual(start)
    const to = this._findFirstGreater(end)
    const count = to - from
    if (count > 0) {
      this._entries.splice(from, count)
      this._stats.deletes += count
    }
    return count
  }

  expire(olderThan: number): number {
    const cutoff = this._findFirstGreaterEqual(olderThan)
    const count = cutoff
    if (count > 0) {
      this._entries.splice(0, cutoff)
      this._stats.expirations += count
      this._stats.deletes += count
    }
    return count
  }

  has(timestamp: number): boolean {
    this._stats.lookups++
    return this._findIndex(timestamp) !== -1
  }

  get size(): number {
    return this._entries.length
  }

  isEmpty(): boolean {
    return this._entries.length === 0
  }

  clear(): void {
    this._entries = []
  }

  toArray(): V[] {
    return this._entries.map((e) => e.value)
  }

  forEach(callback: (value: V, timestamp: number) => void): void {
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i]!
      callback(entry.value, entry.timestamp)
    }
  }

  min(): number | undefined {
    if (this._entries.length === 0) return undefined
    return this._entries[0]!.timestamp
  }

  max(): number | undefined {
    if (this._entries.length === 0) return undefined
    return this._entries[this._entries.length - 1]!.timestamp
  }

  floor(timestamp: number): V | undefined {
    this._stats.lookups++
    const idx = this._findFirstGreater(timestamp) - 1
    if (idx < 0) return undefined
    return this._entries[idx]!.value
  }

  ceil(timestamp: number): V | undefined {
    this._stats.lookups++
    const from = this._findFirstGreaterEqual(timestamp)
    if (from >= this._entries.length) return undefined
    return this._entries[from]!.value
  }

  countInRange(start: number, end: number): number {
    this._stats.rangeQueries++
    if (start > end) return 0
    const from = this._findFirstGreaterEqual(start)
    const to = this._findFirstGreater(end)
    return to - from
  }

  getStatistics(): TimestampIndexStatistics {
    return { ...this._stats }
  }

  *[Symbol.iterator](): Iterator<V> {
    for (let i = 0; i < this._entries.length; i++) {
      yield this._entries[i]!.value
    }
  }
}

export type { TimestampIndexOptions, TimestampIndexStatistics } from './types.js'
export { DEFAULT_TIMESTAMP_INDEX_OPTIONS } from './types.js'
