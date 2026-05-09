import type { Interval } from './types.js'

export class IntervalSet {
  private intervals: Interval[] = []

  add(start: number, end: number): void {
    if (start > end) {
      throw new Error(`Invalid interval: start (${start}) > end (${end})`)
    }
    const merged = this.mergeInterval(start, end)
    this.intervals = merged
  }

  private mergeInterval(start: number, end: number): Interval[] {
    const result: Interval[] = []
    let inserted = false
    let newStart = start
    let newEnd = end

    for (const iv of this.intervals) {
      if (iv.end < newStart - 0) {
        result.push(iv)
      } else if (iv.start > newEnd + 0) {
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
    const result: Interval[] = []
    for (const iv of this.intervals) {
      if (iv.end < start || iv.start > end) {
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

  contains(point: number): boolean {
    for (const iv of this.intervals) {
      if (point >= iv.start && point <= iv.end) {
        return true
      }
    }
    return false
  }

  containsInterval(start: number, end: number): boolean {
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
      if (start <= iv.end && end >= iv.start) {
        return true
      }
    }
    return false
  }

  getIntervals(): [number, number][] {
    return this.intervals.map((iv) => [iv.start, iv.end] as [number, number])
  }

  getSize(): number {
    let total = 0
    for (const iv of this.intervals) {
      total += iv.end - iv.start
    }
    return total
  }

  getCount(): number {
    return this.intervals.length
  }

  isEmpty(): boolean {
    return this.intervals.length === 0
  }

  clear(): void {
    this.intervals = []
  }

  intersect(other: IntervalSet): IntervalSet {
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
      } else if (start === end) {
        // zero-length intersection, skip
      }
      if (ai.end < bj.end) {
        i++
      } else {
        j++
      }
    }

    return result
  }

  union(other: IntervalSet): IntervalSet {
    const result = new IntervalSet()
    result.intervals = this.intervals.slice()
    for (const iv of other.intervals) {
      result.intervals = result.mergeInterval(iv.start, iv.end)
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

  complement(min: number, max: number): IntervalSet {
    const result = new IntervalSet()
    let current = min

    for (const iv of this.intervals) {
      if (iv.start > current) {
        result.intervals.push({ start: current, end: Math.min(iv.start, max) })
      }
      if (iv.end > current) {
        current = iv.end
      }
    }

    if (current < max) {
      result.intervals.push({ start: current, end: max })
    }

    return result
  }

  clone(): IntervalSet {
    const result = new IntervalSet()
    result.intervals = this.intervals.slice()
    return result
  }

  equals(other: IntervalSet): boolean {
    if (this.intervals.length !== other.intervals.length) {
      return false
    }
    for (let i = 0; i < this.intervals.length; i++) {
      const a = this.intervals[i]!!
      const b = other.intervals[i]!!
      if (a.start !== b.start || a.end !== b.end) {
        return false
      }
    }
    return true
  }

  forEach(callback: (start: number, end: number) => void): void {
    for (const iv of this.intervals) {
      callback(iv.start, iv.end)
    }
  }

  static fromIntervals(intervals: [number, number][]): IntervalSet {
    const set = new IntervalSet()
    for (const [start, end] of intervals) {
      set.add(start, end)
    }
    return set
  }
}

export type { Interval } from './types.js'
