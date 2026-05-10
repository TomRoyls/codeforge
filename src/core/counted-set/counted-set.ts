import type { CountedSetOptions, CountedSetJSON, CountedSetStatistics } from './types.js'
import { DEFAULT_COUNTED_SET_OPTIONS } from './types.js'

export class CountedSet<T = unknown> {
  private _map: Map<T, number> = new Map()
  private _totalCount: number = 0
  private _adds: number = 0
  private _removes: number = 0

  constructor(entries?: Iterable<[T, number]>)
  constructor(options?: Partial<CountedSetOptions>)
  constructor(entriesOrOptions?: Iterable<[T, number]> | Partial<CountedSetOptions>) {
    if (entriesOrOptions !== undefined) {
      if (typeof entriesOrOptions === 'object' && entriesOrOptions !== null && Symbol.iterator in entriesOrOptions) {
        for (const [element, count] of entriesOrOptions as Iterable<[T, number]>) {
          if (count > 0) {
            this._map.set(element, count)
            this._totalCount += count
          }
        }
      } else {
        const opts = { ...DEFAULT_COUNTED_SET_OPTIONS, ...entriesOrOptions } as Required<CountedSetOptions>
        if (opts.initialEntries) {
          for (const [element, count] of opts.initialEntries as Iterable<[T, number]>) {
            if (count > 0) {
              this._map.set(element, count)
              this._totalCount += count
            }
          }
        }
      }
    }
  }

  add(element: T, count: number = 1): void {
    if (count <= 0) return
    const current = this._map.get(element) ?? 0
    this._map.set(element, current + count)
    this._totalCount += count
    this._adds++
  }

  remove(element: T, count: number = 1): number {
    const current = this._map.get(element)
    if (current === undefined) return 0
    if (count <= 0) return 0
    const removed = Math.min(count, current)
    const remaining = current - removed
    if (remaining === 0) {
      this._map.delete(element)
    } else {
      this._map.set(element, remaining)
    }
    this._totalCount -= removed
    this._removes++
    return removed
  }

  count(element: T): number {
    return this._map.get(element) ?? 0
  }

  has(element: T): boolean {
    return this._map.has(element)
  }

  setCount(element: T, count: number): void {
    if (count < 0) count = 0
    const current = this._map.get(element) ?? 0
    this._totalCount += count - current
    if (count === 0) {
      this._map.delete(element)
    } else {
      this._map.set(element, count)
    }
  }

  get totalCount(): number {
    return this._totalCount
  }

  get uniqueCount(): number {
    return this._map.size
  }

  get isEmpty(): boolean {
    return this._map.size === 0
  }

  clear(): void {
    this._map.clear()
    this._totalCount = 0
    this._adds = 0
    this._removes = 0
  }

  elements(): T[] {
    return [...this._map.keys()]
  }

  toArray(): T[] {
    const result: T[] = []
    for (const [element, count] of this._map) {
      for (let i = 0; i < count; i++) {
        result.push(element)
      }
    }
    return result
  }

  mostCommon(k?: number): Array<[T, number]> {
    const entries = [...this._map.entries()]
    entries.sort((a, b) => b[1] - a[1])
    return k === undefined ? entries : entries.slice(0, k)
  }

  leastCommon(k?: number): Array<[T, number]> {
    const entries = [...this._map.entries()]
    entries.sort((a, b) => a[1] - b[1])
    return k === undefined ? entries : entries.slice(0, k)
  }

  forEach(callback: (element: T, count: number, set: CountedSet<T>) => void): void {
    for (const [element, count] of this._map) {
      callback(element, count, this)
    }
  }

  *[Symbol.iterator](): Iterator<[T, number]> {
    for (const entry of this._map) {
      yield entry
    }
  }

  merge(other: CountedSet<T>): void {
    for (const [element, count] of other) {
      const current = this._map.get(element) ?? 0
      this._map.set(element, current + count)
    }
    this._totalCount += other.totalCount
    this._adds += other._adds
    this._removes += other._removes
  }

  getStatistics(): CountedSetStatistics {
    let maxCount = 0
    for (const count of this._map.values()) {
      if (count > maxCount) maxCount = count
    }
    return {
      adds: this._adds,
      removes: this._removes,
      totalCount: this._totalCount,
      maxCount,
      uniqueElements: this._map.size,
    }
  }

  toJSON(): CountedSetJSON<T> {
    return {
      entries: [...this._map.entries()],
      statistics: this.getStatistics(),
    }
  }

  static fromJSON<T>(data: CountedSetJSON<T>): CountedSet<T> {
    const set = new CountedSet<T>()
    for (const [element, count] of data.entries) {
      if (count > 0) {
        set._map.set(element, count)
        set._totalCount += count
      }
    }
    return set
  }
}

export { DEFAULT_COUNTED_SET_OPTIONS } from './types.js'
export type { CountedSetOptions, CountedSetJSON, CountedSetStatistics } from './types.js'
