import type { Interval, IntervalSetStats } from './types.js'

export class IntervalSet {
  private intervals: Interval[] = []

  add(start: number, end: number): void {
    if (start > end) {
      throw new Error(`Invalid interval: start (${start}) > end (${end})`)
    }
    this.intervals = this.mergeInterval(start, end)
  }

  private mergeInterval(start: number, end: number): Interval[] {
    const result: Interval[] = []
    let inserted = false
    let newStart = start
    let newEnd = end

    for (const iv of this.intervals) {
      if (iv.end < newStart) {
        result.push(iv)
      } else if (iv.start > newEnd) {
        if (!inserted) {
          result.push({ start: newStart, end: newEnd })
          inserted = true
        }
        result.push(iv)
      } else {
        newStart = Math.min(newStart, iv.start)
        newEnd = Math.max(newEnd, iv.end)
      }
    }

    if (!inserted) {
      result.push({ start: newStart, end: newEnd })
    }

    return result
  }

  remove(start: number, end: number): void {
    if (start > end) {
      throw new Error(`Invalid interval: start (${start}) > end (${end})`)
    }
    if (start === end) return
    const result: Interval[] = []
    for (const iv of this.intervals) {
      if (iv.end <= start || iv.start >= end) {
        result.push(iv)
      } else {
        if (iv.start < start) {
          result.push({ start: iv.start, end: start })
        }
        if (iv.end > end) {
          result.push({ start: end, end: iv.end })
        }
      }
    }
    this.intervals = result
  }

  has(point: number): boolean {
    for (const iv of this.intervals) {
      if (point >= iv.start && point < iv.end) {
        return true
      }
    }
    return false
  }

  hasInterval(start: number, end: number): boolean {
    if (start > end) {
      throw new Error(`Invalid interval: start (${start}) > end (${end})`)
    }
    for (const iv of this.intervals) {
      if (start >= iv.start && end <= iv.end) {
        return true
      }
    }
    return false
  }

  overlaps(start: number, end: number): boolean {
    if (start > end) {
      throw new Error(`Invalid interval: start (${start}) > end (${end})`)
    }
    for (const iv of this.intervals) {
      if (start < iv.end && end > iv.start) {
        return true
      }
    }
    return false
  }

  get isEmpty(): boolean {
    return this.intervals.length === 0
  }

  get size(): number {
    return this.intervals.length
  }

  toArray(): Array<[number, number]> {
    return this.intervals.map((iv): [number, number] => [iv.start, iv.end])
  }

  forEach(callback: (start: number, end: number) => void): void {
    for (const iv of this.intervals) {
      callback(iv.start, iv.end)
    }
  }

  clear(): void {
    this.intervals = []
  }

  clone(): IntervalSet {
    const result = new IntervalSet()
    result.intervals = this.intervals.slice()
    return result
  }

  static from(intervals: Array<[number, number]>): IntervalSet {
    const set = new IntervalSet()
    for (const [start, end] of intervals) {
      set.add(start, end)
    }
    return set
  }

  union(other: IntervalSet): IntervalSet {
    const result = new IntervalSet()
    result.intervals = this.intervals.slice()
    for (const iv of other.intervals) {
      result.intervals = result.mergeInterval(iv.start, iv.end)
    }
    return result
  }

  intersection(other: IntervalSet): IntervalSet {
    const result = new IntervalSet()
    let i = 0
    let j = 0
    const a = this.intervals
    const b = other.intervals

    while (i < a.length && j < b.length) {
      const ai = a[i]!
      const bj = b[j]!
      const start = Math.max(ai.start, bj.start)
      const end = Math.min(ai.end, bj.end)
      if (start < end) {
        result.intervals.push({ start, end })
      }
      if (ai.end < bj.end) {
        i++
      } else {
        j++
      }
    }

    return result
  }

  difference(other: IntervalSet): IntervalSet {
    const result = new IntervalSet()
    result.intervals = this.intervals.slice()
    for (const iv of other.intervals) {
      result.remove(iv.start, iv.end)
    }
    return result
  }

  symmetricDifference(other: IntervalSet): IntervalSet {
    return this.difference(other).union(other.difference(this))
  }

  get min(): number | undefined {
    if (this.intervals.length === 0) return undefined
    return this.intervals[0]!.start
  }

  get max(): number | undefined {
    if (this.intervals.length === 0) return undefined
    return this.intervals[this.intervals.length - 1]!.end
  }

  get totalCovered(): number {
    let total = 0
    for (const iv of this.intervals) {
      total += iv.end - iv.start
    }
    return total
  }

  get stats(): IntervalSetStats {
    const count = this.intervals.length
    if (count === 0) {
      return {
        intervalCount: 0,
        totalCovered: 0,
        min: undefined,
        max: undefined,
        largestInterval: undefined,
        smallestInterval: undefined,
        averageIntervalSize: 0,
      }
    }

    let largestSize = -1
    let smallestSize = Infinity
    let largestIdx = 0
    let smallestIdx = 0

    for (let i = 0; i < count; i++) {
      const iv = this.intervals[i]!
      const sz = iv.end - iv.start
      if (sz > largestSize) {
        largestSize = sz
        largestIdx = i
      }
      if (sz < smallestSize) {
        smallestSize = sz
        smallestIdx = i
      }
    }

    const largest = this.intervals[largestIdx]!
    const smallest = this.intervals[smallestIdx]!
    const total = this.totalCovered

    return {
      intervalCount: count,
      totalCovered: total,
      min: this.intervals[0]!.start,
      max: this.intervals[count - 1]!.end,
      largestInterval: [largest.start, largest.end],
      smallestInterval: [smallest.start, smallest.end],
      averageIntervalSize: count > 0 ? total / count : 0,
    }
  }
}

export type { Interval, IntervalSetStats } from './types.js'
