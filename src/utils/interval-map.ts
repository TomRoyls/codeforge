export interface Interval<T> {
  start: number
  end: number
  value: T
}

export class IntervalMap<T> {
  private intervals: Interval<T>[] = []

  constructor() {}

  set(start: number, end: number, value: T): void {
    if (start >= end) {
      throw new RangeError(`start (${start}) must be < end (${end})`)
    }

    const result: Interval<T>[] = []
    let i = 0

    while (i < this.intervals.length && this.intervals[i]!.end <= start) {
      result.push(this.intervals[i]!)
      i++
    }

    while (i < this.intervals.length && this.intervals[i]!.start < end) {
      const iv = this.intervals[i]!
      if (iv.start < start) {
        result.push({ start: iv.start, end: start, value: iv.value })
      }
      if (iv.end > end) {
        result.push({ start: end, end: iv.end, value: iv.value })
      }
      i++
    }

    result.push({ start, end, value })

    while (i < this.intervals.length) {
      result.push(this.intervals[i]!)
      i++
    }

    this.intervals = result
    this.mergeAdjacent()
  }

  get(point: number): T | undefined {
    for (const iv of this.intervals) {
      if (point >= iv.start && point < iv.end) {
        return iv.value
      }
    }
    return undefined
  }

  getInterval(start: number, end: number): Array<{ start: number; end: number; value: T }> {
    const result: Array<{ start: number; end: number; value: T }> = []

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

  remove(start: number, end: number): void {
    const result: Interval<T>[] = []

    for (const iv of this.intervals) {
      if (iv.end <= start || iv.start >= end) {
        result.push(iv)
      } else if (start <= iv.start && end >= iv.end) {
        continue
      } else if (start > iv.start && end < iv.end) {
        result.push({ start: iv.start, end: start, value: iv.value })
        result.push({ start: end, end: iv.end, value: iv.value })
      } else if (start > iv.start) {
        result.push({ start: iv.start, end: start, value: iv.value })
      } else if (end < iv.end) {
        result.push({ start: end, end: iv.end, value: iv.value })
      }
    }

    this.intervals = result
  }

  has(point: number): boolean {
    return this.get(point) !== undefined
  }

  get size(): number {
    return this.intervals.length
  }

  getAllIntervals(): Array<{ start: number; end: number; value: T }> {
    return this.intervals.map((iv) => ({
      start: iv.start,
      end: iv.end,
      value: iv.value,
    }))
  }

  clear(): void {
    this.intervals = []
  }

  private mergeAdjacent(): void {
    if (this.intervals.length === 0) return

    const merged: Interval<T>[] = [this.intervals[0]!]

    for (let i = 1; i < this.intervals.length; i++) {
      const current = this.intervals[i]!
      const last = merged[merged.length - 1]!

      if (last.end === current.start && last.value === current.value) {
        merged[merged.length - 1] = {
          start: last.start,
          end: current.end,
          value: last.value,
        }
      } else {
        merged.push(current)
      }
    }

    this.intervals = merged
  }
}