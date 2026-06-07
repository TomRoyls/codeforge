export interface FrequencyMapOptions {
  readonly initialCapacity?: number
}

import { sortedBy, sortedByDesc } from './array-helpers.js'

export interface FrequencyEntry<T> {
  readonly key: T
  readonly count: number
}

export interface FrequencyMapStatistics<T> {
  readonly uniqueKeys: number
  readonly totalObservations: number
  readonly maxCount: number
  readonly minCount: number
  readonly topKey: T | undefined
}

export class FrequencyMap<T> {
  private counts: Map<T, number> = new Map()
  private total = 0
  private _maxKey: T | undefined
  private _maxCount = 0

  constructor(_options?: FrequencyMapOptions) {
    void _options
  }

  add(key: T, count: number = 1): void {
    if (count <= 0) return
    const current = this.counts.get(key) ?? 0
    const newCount = current + count
    this.counts.set(key, newCount)
    this.total += count
    if (newCount > this._maxCount) {
      this._maxCount = newCount
      this._maxKey = key
    }
  }

  remove(key: T): boolean {
    const current = this.counts.get(key)
    if (current === undefined) return false
    this.total -= current
    this.counts.delete(key)
    if (key === this._maxKey) {
      this.recomputeMax()
    }
    return true
  }

  decrease(key: T, count: number = 1): boolean {
    const current = this.counts.get(key)
    if (current === undefined) return false
    if (count >= current) {
      return this.remove(key)
    }
    this.counts.set(key, current - count)
    this.total -= count
    if (key === this._maxKey) {
      this.recomputeMax()
    }
    return true
  }

  get(key: T): number {
    return this.counts.get(key) ?? 0
  }

  has(key: T): boolean {
    return this.counts.has(key)
  }

  get size(): number {
    return this.counts.size
  }

  get totalObservations(): number {
    return this.total
  }

  get isEmpty(): boolean {
    return this.counts.size === 0
  }

  get maxKey(): T | undefined {
    return this._maxKey
  }

  get maxCount(): number {
    return this._maxCount
  }

  clear(): void {
    this.counts.clear()
    this.total = 0
    this._maxKey = undefined
    this._maxCount = 0
  }

  keys(): T[] {
    return Array.from(this.counts.keys())
  }

  values(): number[] {
    return Array.from(this.counts.values())
  }

  entries(): FrequencyEntry<T>[] {
    const result: FrequencyEntry<T>[] = []
    this.counts.forEach((count, key) => {
      result.push({ key, count })
    })
    return result
  }

  forEach(callback: (key: T, count: number) => void): void {
    this.counts.forEach((count, key) => callback(key, count))
  }

  top(k: number): FrequencyEntry<T>[] {
    const entries = this.entries()
    return sortedByDesc(entries, e => e.count).slice(0, Math.max(0, k))
  }

  bottom(k: number): FrequencyEntry<T>[] {
    const entries = this.entries()
    return sortedBy(entries, e => e.count).slice(0, Math.max(0, k))
  }

  above(threshold: number): FrequencyEntry<T>[] {
    const result: FrequencyEntry<T>[] = []
    this.counts.forEach((count, key) => {
      if (count > threshold) result.push({ key, count })
    })
    return sortedByDesc(result, e => e.count)
  }

  below(threshold: number): FrequencyEntry<T>[] {
    const result: FrequencyEntry<T>[] = []
    this.counts.forEach((count, key) => {
      if (count < threshold) result.push({ key, count })
    })
    return sortedBy(result, e => e.count)
  }

  merge(other: FrequencyMap<T>): void {
    other.forEach((key, count) => this.add(key, count))
  }

  clone(): FrequencyMap<T> {
    const copy = new FrequencyMap<T>()
    this.counts.forEach((count, key) => {
      copy.counts.set(key, count)
    })
    copy.total = this.total
    copy._maxKey = this._maxKey
    copy._maxCount = this._maxCount
    return copy
  }

  toArray(): FrequencyEntry<T>[] {
    return this.entries()
  }

  getStatistics(): FrequencyMapStatistics<T> {
    let minCount = Infinity
    this.counts.forEach((count) => {
      if (count < minCount) minCount = count
    })
    return {
      uniqueKeys: this.counts.size,
      totalObservations: this.total,
      maxCount: this._maxCount,
      minCount: this.counts.size > 0 ? minCount : 0,
      topKey: this._maxKey,
    }
  }

  private recomputeMax(): void {
    this._maxCount = 0
    this._maxKey = undefined
    this.counts.forEach((count, key) => {
      if (count > this._maxCount) {
        this._maxCount = count
        this._maxKey = key
      }
    })
  }

  toString(): string {
    return `FrequencyMap(${this.counts.size} unique, ${this.total} total)`
  }

  toJSON(): FrequencyEntry<T>[] {
    return this.entries()
  }

  equals(other: unknown): boolean {
    if (!(other instanceof FrequencyMap)) return false
    if (this.counts.size !== other.counts.size) return false
    for (const [key, count] of this.counts) {
      if (other.counts.get(key) !== count) return false
    }
    return true
  }
}


