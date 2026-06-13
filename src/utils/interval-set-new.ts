export class IntervalSet {
  private intervals: Array<{ start: number; end: number }> = []

  add(start: number, end: number): void {
    if (start > end) return
    this.intervals.push({ start, end })
    this.merge()
  }

  remove(start: number, end: number): void {
    if (start > end) return
    const result: Array<{ start: number; end: number }> = []
    for (const iv of this.intervals) {
      if (iv.end < start || iv.start > end) {
        result.push(iv)
      } else {
        if (iv.start < start) result.push({ start: iv.start, end: start })
        if (iv.end > end) result.push({ start: end, end: iv.end })
      }
    }
    this.intervals = result
  }

  contains(point: number): boolean {
    for (const iv of this.intervals) {
      if (point >= iv.start && point <= iv.end) return true
    }
    return false
  }

  overlaps(start: number, end: number): boolean {
    for (const iv of this.intervals) {
      if (iv.start <= end && iv.end >= start) return true
    }
    return false
  }

  get totalLength(): number {
    return this.intervals.reduce((sum, iv) => sum + (iv.end - iv.start), 0)
  }

  get count(): number { return this.intervals.length }
  get isEmpty(): boolean { return this.intervals.length === 0 }

  clear(): void { this.intervals = [] }

  toArray(): Array<{ start: number; end: number }> {
    return this.intervals.map((iv) => ({ start: iv.start, end: iv.end }))
  }

  toString(): string { return JSON.stringify(this.intervals) }
  toJSON(): Array<{ start: number; end: number }> { return this.toArray() }

  clone(): IntervalSet {
    const is = new IntervalSet()
    is.intervals = this.intervals.map((iv) => ({ ...iv }))
    return is
  }

  equals(other: unknown): boolean {
    if (!(other instanceof IntervalSet)) return false
    if (this.intervals.length !== other.intervals.length) return false
    return this.intervals.every((iv, i) => iv.start === other.intervals[i]!.start && iv.end === other.intervals[i]!.end)
  }

  private merge(): void {
    this.intervals.sort((a, b) => a.start - b.start)
    const result: Array<{ start: number; end: number }> = []
    for (const iv of this.intervals) {
      if (result.length > 0 && result[result.length - 1]!.end >= iv.start) {
        result[result.length - 1]!.end = Math.max(result[result.length - 1]!.end, iv.end)
      } else {
        result.push({ ...iv })
      }
    }
    this.intervals = result
  }
}
