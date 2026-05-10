import type { CircularSetOptions, CircularSetStats } from './types.js'
import { DEFAULT_CIRCULAR_SET_OPTIONS } from './types.js'

export class CircularSet<T = unknown> {
  private _capacity: number
  private items: Map<T, number> = new Map()
  private _totalAdded: number = 0
  private _totalEvicted: number = 0
  private _totalDeleted: number = 0
  private _insertCounter: number = 0

  constructor(options: Partial<CircularSetOptions> & { capacity: number } | { capacity: number }) {
    const opts = { ...DEFAULT_CIRCULAR_SET_OPTIONS, ...options }
    this._capacity = Math.max(1, opts.capacity)
  }

  add(item: T): boolean {
    if (this.items.has(item)) {
      return false
    }

    if (this.items.size === this._capacity) {
      this.evictOldest()
    }

    this.items.set(item, this._insertCounter++)
    this._totalAdded++
    return true
  }

  delete(item: T): boolean {
    if (!this.items.has(item)) {
      return false
    }

    this.items.delete(item)
    this._totalDeleted++
    return true
  }

  has(item: T): boolean {
    return this.items.has(item)
  }

  get first(): T | undefined {
    const firstEntry = this.items.keys().next()
    return firstEntry.done ? undefined : firstEntry.value
  }

  get last(): T | undefined {
    let last: T | undefined = undefined
    for (const key of this.items.keys()) {
      last = key
    }
    return last
  }

  get size(): number {
    return this.items.size
  }

  get capacity(): number {
    return this._capacity
  }

  get isFull(): boolean {
    return this.items.size === this._capacity
  }

  get isEmpty(): boolean {
    return this.items.size === 0
  }

  clear(): void {
    this.items.clear()
  }

  clone(): CircularSet<T> {
    const result = new CircularSet<T>({ capacity: this._capacity })
    for (const item of this) {
      result.add(item)
    }
    return result
  }

  toArray(): T[] {
    return [...this.items.keys()]
  }

  forEach(callback: (item: T, index: number) => void): void {
    let idx = 0
    for (const item of this.items.keys()) {
      callback(item, idx)
      idx++
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (const key of this.items.keys()) {
      yield key
    }
  }

  static from<T>(items: Iterable<T>, capacity: number): CircularSet<T> {
    const set = new CircularSet<T>({ capacity })
    for (const item of items) {
      set.add(item)
    }
    return set
  }

  indexOf(item: T): number {
    if (!this.items.has(item)) return -1
    let idx = 0
    for (const key of this.items.keys()) {
      if (key === item) return idx
      idx++
    }
    return -1
  }

  atIndex(index: number): T | undefined {
    if (index < 0 || index >= this.items.size) return undefined
    let idx = 0
    for (const key of this.items.keys()) {
      if (idx === index) return key
      idx++
    }
    return undefined
  }

  stats(): CircularSetStats {
    return {
      capacity: this._capacity,
      size: this.items.size,
      isEmpty: this.items.size === 0,
      isFull: this.items.size === this._capacity,
      utilization: this.items.size / this._capacity,
      totalAdded: this._totalAdded,
      totalEvicted: this._totalEvicted,
      totalDeleted: this._totalDeleted,
    }
  }

  private evictOldest(): void {
    const firstKey = this.items.keys().next()
    if (!firstKey.done) {
      this.items.delete(firstKey.value)
      this._totalEvicted++
    }
  }
}

export { DEFAULT_CIRCULAR_SET_OPTIONS } from './types.js'
export type { CircularSetOptions, CircularSetStats } from './types.js'
