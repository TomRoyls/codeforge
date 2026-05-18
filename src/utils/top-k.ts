export interface TopKEntry<T> {
  value: T
  count: number
}
import { sortedByDesc } from './array-helpers.js'

export class TopK<T> {
  private counts: Map<T, number> = new Map()
  private readonly _k: number

  constructor(k: number) {
    if (k < 1) throw new RangeError(`k must be >= 1, got ${k}`)
    this._k = k
  }

  add(value: T, count: number = 1): void {
    if (count <= 0) return
    const current = this.counts.get(value) ?? 0
    this.counts.set(value, current + count)
  }

  get top(): TopKEntry<T>[] {
    const entries: TopKEntry<T>[] = []
    this.counts.forEach((count, value) => {
      entries.push({ value, count })
    })
    return sortedByDesc(entries, e => e.count).slice(0, this._k)
  }

  get topValues(): T[] {
    return this.top.map((e) => e.value)
  }

  has(value: T): boolean {
    return this.counts.has(value)
  }

  getCount(value: T): number {
    return this.counts.get(value) ?? 0
  }

  get size(): number {
    return this.counts.size
  }

  get k(): number {
    return this._k
  }

  get isEmpty(): boolean {
    return this.counts.size === 0
  }

  get totalCount(): number {
    let sum = 0
    this.counts.forEach((c) => (sum += c))
    return sum
  }

  remove(value: T): boolean {
    return this.counts.delete(value)
  }

  clear(): void {
    this.counts.clear()
  }

  merge(other: TopK<T>): TopK<T> {
    const result = new TopK<T>(Math.max(this._k, other._k))
    this.counts.forEach((count, value) => result.add(value, count))
    other.counts.forEach((count, value) => result.add(value, count))
    return result
  }

  forEach(callback: (entry: TopKEntry<T>) => void): void {
    this.top.forEach(callback)
  }
}
