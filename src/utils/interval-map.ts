export interface Interval<T> {
  start: number
  end: number
  value: T
}

export class IntervalMap<T> {
  private intervals: Interval<T>[] = []

  constructor() {}

  set(start: number, end: number, value: T): void {
    if (start > end) {
      throw new RangeError(`start (${start}) must be <= end (${end})`)
    }
    const entry: Interval<T> = { start, end, value }
    const idx = this.lowerBound(start)
    this.intervals.splice(idx, 0, entry)
  }

  get(point: number): T | undefined {
    for (const iv of this.intervals) {
      if (point >= iv.start && point <= iv.end) return iv.value
    }
    return undefined
  }

  has(point: number): boolean {
    return this.get(point) !== undefined
  }

  // Returns values for every interval overlapping [start, end] (inclusive),
  // sorted by interval start.
  getRange(start: number, end: number): T[] {
    const result: T[] = []
    for (const iv of this.intervals) {
      if (iv.end >= start && iv.start <= end) result.push(iv.value)
    }
    return result
  }

  getAll(): Interval<T>[] {
    return this.intervals.map((iv) => ({ start: iv.start, end: iv.end, value: iv.value }))
  }

  get size(): number {
    return this.intervals.length
  }

  get isEmpty(): boolean {
    return this.intervals.length === 0
  }

  delete(point: number): boolean {
    for (let i = 0; i < this.intervals.length; i++) {
      const iv = this.intervals[i]!
      if (point >= iv.start && point <= iv.end) {
        this.intervals.splice(i, 1)
        return true
      }
    }
    return false
  }

  deleteRange(start: number, end: number): number {
    let removed = 0
    this.intervals = this.intervals.filter((iv) => {
      const overlaps = iv.end >= start && iv.start <= end
      if (overlaps) removed++
      return !overlaps
    })
    return removed
  }

  clear(): void {
    this.intervals = []
  }

  getMinStart(): number | undefined {
    if (this.intervals.length === 0) return undefined
    let min = this.intervals[0]!.start
    for (let i = 1; i < this.intervals.length; i++) {
      if (this.intervals[i]!.start < min) min = this.intervals[i]!.start
    }
    return min
  }

  getMaxEnd(): number | undefined {
    if (this.intervals.length === 0) return undefined
    let max = this.intervals[0]!.end
    for (let i = 1; i < this.intervals.length; i++) {
      if (this.intervals[i]!.end > max) max = this.intervals[i]!.end
    }
    return max
  }

  forEach(callback: (entry: Interval<T>, index: number) => void): void {
    for (let i = 0; i < this.intervals.length; i++) {
      const iv = this.intervals[i]!
      callback({ start: iv.start, end: iv.end, value: iv.value }, i)
    }
  }

  overlaps(start: number, end: number): boolean {
    for (const iv of this.intervals) {
      if (iv.end >= start && iv.start <= end) return true
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

  private lowerBound(start: number): number {
    let lo = 0
    let hi = this.intervals.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.intervals[mid]!.start < start) lo = mid + 1
      else hi = mid
    }
    return lo
  }
}
