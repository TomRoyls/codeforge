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
    let i = 0
    while (i < this.intervals.length && this.intervals[i]!.start <= start) {
      i++
    }
    this.intervals.splice(i, 0, entry)
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

  getInterval(start: number, end: number): Interval<T>[] {
    const result: Interval<T>[] = []
    for (const iv of this.intervals) {
      if (iv.end >= start && iv.start <= end) {
        result.push(iv)
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

  remove(start: number, end: number): void {
    this.intervals = this.intervals.filter((iv) => iv.end < start || iv.start > end)
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
    const before = this.intervals.length
    this.intervals = this.intervals.filter((iv) => iv.end < start || iv.start > end)
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
    let max: number | undefined
    for (const iv of this.intervals) {
      if (max === undefined || iv.end > max) max = iv.end
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

  toString(): string {
    return `IntervalMap(${this.intervals.length})`
  }

  toJSON(): unknown {
    return this.intervals.map((iv) => ({ start: iv.start, end: iv.end, value: iv.value }))
  }

  equals(other: unknown): boolean {
    if (!(other instanceof IntervalMap)) return false
    if (this.intervals.length !== other.intervals.length) return false
    for (let i = 0; i < this.intervals.length; i++) {
      const a = this.intervals[i]!
      const b = other.intervals[i]!
      if (a.start !== b.start || a.end !== b.end) return false
      if (!Object.is(a.value, b.value)) return false
    }
    return true
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
}
