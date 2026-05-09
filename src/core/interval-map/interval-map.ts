import type { IntervalMapEntry, IntervalMapOptions } from './types.js'
import { defaultComparator } from './types.js'

export class IntervalMap<K, V> {
  private intervals: IntervalMapEntry<K, V>[] = []
  private compare: (a: K, b: K) => number

  constructor(options?: IntervalMapOptions<K>) {
    this.compare = options?.comparator ?? (defaultComparator as (a: K, b: K) => number)
  }

  set(low: K, high: K, value: V): void {
    if (this.compare(low, high) > 0) {
      throw new Error(`Invalid interval: low > high`)
    }
    this.intervals.push({ low, high, value })
  }

  get(key: K): V | undefined {
    for (let i = this.intervals.length - 1; i >= 0; i--) {
      const entry = this.intervals[i]!
      if (this.compare(key, entry.low) >= 0 && this.compare(key, entry.high) < 0) {
        return entry.value
      }
    }
    return undefined
  }

  getInterval(low: K, high: K): IntervalMapEntry<K, V>[] {
    const results: IntervalMapEntry<K, V>[] = []
    for (const entry of this.intervals) {
      if (this.compare(low, entry.high) < 0 && this.compare(high, entry.low) > 0) {
        results.push(entry)
      }
    }
    return results
  }

  delete(low: K, high: K): boolean {
    for (let i = this.intervals.length - 1; i >= 0; i--) {
      const entry = this.intervals[i]!
      if (this.compare(entry.low, low) === 0 && this.compare(entry.high, high) === 0) {
        this.intervals.splice(i, 1)
        return true
      }
    }
    return false
  }

  contains(key: K): boolean {
    for (const entry of this.intervals) {
      if (this.compare(key, entry.low) >= 0 && this.compare(key, entry.high) < 0) {
        return true
      }
    }
    return false
  }

  containsInterval(low: K, high: K): boolean {
    if (this.compare(low, high) > 0) return false
    let current = low
    const gaps: { low: K; high: K }[] = []
    for (const entry of this.intervals) {
      const entryLow = entry.low
      const entryHigh = entry.high
      if (this.compare(entryHigh, low) <= 0 || this.compare(entryLow, high) >= 0) continue
      gaps.push({
        low: this.compare(entryLow, low) > 0 ? entryLow : low,
        high: this.compare(entryHigh, high) < 0 ? entryHigh : high,
      })
    }
    if (gaps.length === 0) return false
    gaps.sort((a, b) => this.compare(a.low, b.low))
    if (this.compare(gaps[0]!.low, low) > 0) return false
    current = gaps[0]!.high
    for (let i = 1; i < gaps.length; i++) {
      const gap = gaps[i]!
      if (this.compare(gap.low, current) > 0) return false
      if (this.compare(gap.high, current) > 0) {
        current = gap.high
      }
    }
    return this.compare(current, high) >= 0
  }

  overlaps(low: K, high: K): boolean {
    for (const entry of this.intervals) {
      if (this.compare(low, entry.high) < 0 && this.compare(high, entry.low) > 0) {
        return true
      }
    }
    return false
  }

  size(): number {
    return this.intervals.length
  }

  isEmpty(): boolean {
    return this.intervals.length === 0
  }

  clear(): void {
    this.intervals = []
  }

  keys(): K[] {
    const result: K[] = []
    for (const entry of this.intervals) {
      result.push(entry.low, entry.high)
    }
    return result
  }

  values(): V[] {
    return this.intervals.map((e) => e.value)
  }

  entries(): IntervalMapEntry<K, V>[] {
    return this.intervals.map((e) => ({ low: e.low, high: e.high, value: e.value }))
  }

  min(): K | undefined {
    if (this.intervals.length === 0) return undefined
    let minVal = this.intervals[0]!.low
    for (let i = 1; i < this.intervals.length; i++) {
      if (this.compare(this.intervals[i]!.low, minVal) < 0) {
        minVal = this.intervals[i]!.low
      }
    }
    return minVal
  }

  max(): K | undefined {
    if (this.intervals.length === 0) return undefined
    let maxVal = this.intervals[0]!.high
    for (let i = 1; i < this.intervals.length; i++) {
      if (this.compare(this.intervals[i]!.high, maxVal) > 0) {
        maxVal = this.intervals[i]!.high
      }
    }
    return maxVal
  }

  clone(): IntervalMap<K, V> {
    const result = new IntervalMap<K, V>({ comparator: this.compare })
    for (const entry of this.intervals) {
      result.intervals.push({ low: entry.low, high: entry.high, value: entry.value })
    }
    return result
  }

  [Symbol.iterator](): Iterator<IntervalMapEntry<K, V>> {
    let index = 0
    const intervals = this.intervals
    return {
      next(): IteratorResult<IntervalMapEntry<K, V>> {
        if (index >= intervals.length) {
          return { done: true, value: undefined }
        }
        const entry = intervals[index]!
        index++
        return { done: false, value: { low: entry.low, high: entry.high, value: entry.value } }
      },
    }
  }
}

export { defaultComparator } from './types.js'
export type { IntervalMapEntry, IntervalMapOptions } from './types.js'
