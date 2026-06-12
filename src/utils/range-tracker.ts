export class RangeTracker {
  private ranges: Array<[number, number]> = []

  add(start: number, end: number): void {
    if (start > end) [start, end] = [end, start]
    this.ranges.push([start, end])
    this.merge()
  }

  remove(start: number, end: number): void {
    if (start > end) [start, end] = [end, start]
    const result: Array<[number, number]> = []
    for (const [rs, re] of this.ranges) {
      if (end <= rs || start >= re) {
        result.push([rs, re])
      } else {
        if (start > rs) result.push([rs, start])
        if (end < re) result.push([end, re])
      }
    }
    this.ranges = result
  }

  contains(value: number): boolean {
    for (const [start, end] of this.ranges) {
      if (value >= start && value < end) return true
    }
    return false
  }

  overlaps(start: number, end: number): boolean {
    for (const [rs, re] of this.ranges) {
      if (start < re && end > rs) return true
    }
    return false
  }

  get totalSize(): number {
    return this.ranges.reduce((sum, [s, e]) => sum + (e - s), 0)
  }

  get rangeCount(): number {
    return this.ranges.length
  }

  get isEmpty(): boolean {
    return this.ranges.length === 0
  }

  get min(): number | undefined {
    return this.ranges[0]?.[0]
  }

  get max(): number | undefined {
    return this.ranges[this.ranges.length - 1]?.[1]
  }

  toArray(): Array<[number, number]> {
    return this.ranges.map(([s, e]) => [s, e])
  }

  clear(): void {
    this.ranges = []
  }

  toString(): string {
    return JSON.stringify(this.ranges)
  }

  toJSON(): Array<[number, number]> {
    return this.toArray()
  }

  clone(): RangeTracker {
    const copy = new RangeTracker()
    copy.ranges = this.ranges.map(([s, e]) => [s, e])
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RangeTracker)) return false
    if (this.ranges.length !== other.ranges.length) return false
    for (let i = 0; i < this.ranges.length; i++) {
      if (this.ranges[i]![0] !== other.ranges[i]![0] || this.ranges[i]![1] !== other.ranges[i]![1]) return false
    }
    return true
  }

  private merge(): void {
    this.ranges.sort((a, b) => a[0] - b[0])
    const result: Array<[number, number]> = [this.ranges[0]!]
    for (let i = 1; i < this.ranges.length; i++) {
      const last = result[result.length - 1]!
      const current = this.ranges[i]!
      if (current[0] <= last[1]) {
        last[1] = Math.max(last[1], current[1])
      } else {
        result.push(current)
      }
    }
    this.ranges = result
  }
}
