export interface Interval {
  readonly start: number
  readonly end: number
}

export class DisjointIntervalSet {
  private intervals: Interval[] = []

  add(start: number, end: number): void {
    if (start > end) {
      throw new RangeError(`start (${start}) must be <= end (${end})`)
    }
    const merged: Interval[] = []
    let newStart = start
    let newEnd = end
    let absorbed = false
    for (const iv of this.intervals) {
      if (iv.end < newStart - 1) {
        merged.push(iv)
      } else if (iv.start > newEnd + 1) {
        if (!absorbed) {
          merged.push({ start: newStart, end: newEnd })
          absorbed = true
        }
        merged.push(iv)
      } else {
        newStart = Math.min(newStart, iv.start)
        newEnd = Math.max(newEnd, iv.end)
      }
    }
    if (!absorbed) {
      merged.push({ start: newStart, end: newEnd })
    }
    this.intervals = merged
  }

  remove(start: number, end: number): void {
    if (start > end) return
    const result: Interval[] = []
    for (const iv of this.intervals) {
      if (iv.end < start || iv.start > end) {
        result.push(iv)
      } else {
        if (iv.start < start) {
          result.push({ start: iv.start, end: start - 1 })
        }
        if (iv.end > end) {
          result.push({ start: end + 1, end: iv.end })
        }
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

  containsInterval(start: number, end: number): boolean {
    for (const iv of this.intervals) {
      if (iv.start <= start && iv.end >= end) return true
    }
    return false
  }

  overlaps(start: number, end: number): boolean {
    for (const iv of this.intervals) {
      if (iv.start <= end && iv.end >= start) return true
    }
    return false
  }

  findContaining(point: number): Interval | undefined {
    for (const iv of this.intervals) {
      if (point >= iv.start && point <= iv.end) return iv
    }
    return undefined
  }

  get size(): number {
    return this.intervals.length
  }

  get isEmpty(): boolean {
    return this.intervals.length === 0
  }

  getTotalCovered(): number {
    let total = 0
    for (const iv of this.intervals) {
      total += iv.end - iv.start + 1
    }
    return total
  }

  getIntervals(): Interval[] {
    return [...this.intervals]
  }

  getMin(): number | undefined {
    return this.intervals[0]?.start
  }

  getMax(): number | undefined {
    return this.intervals[this.intervals.length - 1]?.end
  }

  clear(): void {
    this.intervals = []
  }

  clone(): DisjointIntervalSet {
    const copy = new DisjointIntervalSet()
    copy.intervals = this.intervals.map((iv) => ({ ...iv }))
    return copy
  }

  union(other: DisjointIntervalSet): DisjointIntervalSet {
    const result = this.clone()
    for (const iv of other.intervals) {
      result.add(iv.start, iv.end)
    }
    return result
  }

  intersection(other: DisjointIntervalSet): DisjointIntervalSet {
    const result = new DisjointIntervalSet()
    for (const a of this.intervals) {
      for (const b of other.intervals) {
        const start = Math.max(a.start, b.start)
        const end = Math.min(a.end, b.end)
        if (start <= end) {
          result.add(start, end)
        }
      }
    }
    return result
  }

  difference(other: DisjointIntervalSet): DisjointIntervalSet {
    const result = this.clone()
    for (const iv of other.intervals) {
      result.remove(iv.start, iv.end)
    }
    return result
  }

  forEach(callback: (interval: Interval, index: number) => void): void {
    this.intervals.forEach((iv, i) => callback(iv, i))
  }
}
