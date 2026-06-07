export interface Interval<T> {
  start: number
  end: number
  value: T
}

/**
 * A map from half-open intervals [start, end) to values.
 * Supports overlapping interval handling, splitting, and merging.
 */
export class IntervalMap<T> {
  private intervals: Interval<T>[] = []

  constructor() {}

  /**
   * Set the value for [start, end).
   * Overwrites any overlapping portion of existing intervals.
   * Merges adjacent intervals with the same value.
   * Throws RangeError if start >= end.
   */
  set(start: number, end: number, value: T): void {
    if (start >= end) {
      throw new RangeError(`start (${start}) must be < end (${end})`)
    }

    // Collect all intervals that overlap with [start, end)
    // and replace them with the new interval, preserving non-overlapping portions.
    const result: Interval<T>[] = []
    let inserted = false

    for (const iv of this.intervals) {
      if (iv.end <= start) {
        // No overlap, iv is entirely before [start, end)
        result.push(iv)
      } else if (iv.start >= end) {
        // No overlap, iv is entirely after [start, end)
        if (!inserted) {
          result.push({ start, end, value })
          inserted = true
        }
        result.push(iv)
      } else {
        // Overlap: clip or split iv
        // Keep [iv.start, start) if it exists
        if (iv.start < start) {
          result.push({ start: iv.start, end: start, value: iv.value })
        }
        // Insert new interval if not yet inserted
        if (!inserted) {
          result.push({ start, end, value })
          inserted = true
        }
        // Keep [end, iv.end) if it exists
        if (iv.end > end) {
          result.push({ start: end, end: iv.end, value: iv.value })
        }
      }
    }

    if (!inserted) {
      result.push({ start, end, value })
    }

    // Merge adjacent intervals with the same value
    this.intervals = this.mergeAdjacent(result)
  }

  get(point: number): T | undefined {
    for (const iv of this.intervals) {
      if (point >= iv.start && point < iv.end) return iv.value
    }
    return undefined
  }

  has(point: number): boolean {
    return this.get(point) !== undefined
  }

  getInterval(start: number, end: number): Interval<T>[] {
    const result: Interval<T>[] = []
    for (const iv of this.intervals) {
      if (iv.end > start && iv.start < end) {
        result.push({
          start: Math.max(iv.start, start),
          end: Math.min(iv.end, end),
          value: iv.value,
        })
      }
    }
    return result
  }

  getRange(start: number, end: number): T[] {
    return this.getInterval(start, end).map((iv) => iv.value)
  }

  getAll(): Interval<T>[] {
    return this.intervals.map((iv) => ({ start: iv.start, end: iv.end, value: iv.value }))
  }

  getAllIntervals(): Interval<T>[] {
    return this.getAll()
  }

  /**
   * Remove the range [start, end) from all intervals.
   * May split intervals that partially overlap.
   */
  remove(start: number, end: number): void {
    const result: Interval<T>[] = []
    for (const iv of this.intervals) {
      if (iv.end <= start || iv.start >= end) {
        // No overlap
        result.push(iv)
      } else {
        // Overlap: keep non-overlapping portions
        if (iv.start < start) {
          result.push({ start: iv.start, end: start, value: iv.value })
        }
        if (iv.end > end) {
          result.push({ start: end, end: iv.end, value: iv.value })
        }
      }
    }
    this.intervals = result
  }

  delete(point: number): boolean {
    for (let i = 0; i < this.intervals.length; i++) {
      const iv = this.intervals[i]!
      if (point >= iv.start && point < iv.end) {
        this.intervals.splice(i, 1)
        return true
      }
    }
    return false
  }

  deleteRange(start: number, end: number): number {
    const before = this.intervals.length
    const result: Interval<T>[] = []
    for (const iv of this.intervals) {
      if (iv.end <= start || iv.start >= end) {
        result.push(iv)
      }
    }
    this.intervals = result
    return before - this.intervals.length
  }

  clear(): void {
    this.intervals = []
  }

  get size(): number {
    return this.intervals.length
  }

  get isEmpty(): boolean {
    return this.intervals.length === 0
  }

  getMinStart(): number | undefined {
    return this.intervals[0]?.start
  }

  getMaxEnd(): number | undefined {
    return this.intervals[this.intervals.length - 1]?.end
  }

  forEach(callback: (entry: Interval<T>, index: number) => void): void {
    for (let i = 0; i < this.intervals.length; i++) {
      const iv = this.intervals[i]!
      callback({ start: iv.start, end: iv.end, value: iv.value }, i)
    }
  }

  overlaps(start: number, end: number): boolean {
    for (const iv of this.intervals) {
      if (iv.end > start && iv.start < end) return true
    }
    return false
  }

  clone(): IntervalMap<T> {
    const copy = new IntervalMap<T>()
    copy.intervals = this.intervals.map((iv) => ({ start: iv.start, end: iv.end, value: iv.value }))
    return copy
  }

  [Symbol.iterator](): Iterator<Interval<T>> {
    let i = 0
    const intervals = this.intervals
    return {
      next(): IteratorResult<Interval<T>> {
        if (i >= intervals.length) return { done: true, value: undefined as unknown as Interval<T> }
        const iv = intervals[i]!
        i++
        return { done: false, value: { start: iv.start, end: iv.end, value: iv.value } }
      },
    }
  }

  // ─── Internal helpers ──────────────────────────────────────────

  private mergeAdjacent(intervals: Interval<T>[]): Interval<T>[] {
    if (intervals.length === 0) return []
    const sorted = [...intervals].sort((a, b) => a.start - b.start)
    const result: Interval<T>[] = [sorted[0]!]
    for (let i = 1; i < sorted.length; i++) {
      const prev = result[result.length - 1]!
      const curr = sorted[i]!
      if (prev.end === curr.start && prev.value === curr.value) {
        prev.end = curr.end
      } else {
        result.push(curr)
      }
    }
    return result
  }
}
