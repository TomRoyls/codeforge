export class IntervalSet2 {
  private _intervals: [number, number][] = []

  add(start: number, end: number): void {
    if (start > end) {
      [start, end] = [end, start]
    }
    const result: [number, number][] = []
    let i = 0
    const n = this._intervals.length!

    while (i < n && this._intervals[i]![1] < start - 1) {
      result.push(this._intervals[i]!)
      i++
    }

    let mergeStart = start
    let mergeEnd = end
    while (i < n && this._intervals[i]![0] <= end + 1) {
      mergeStart = Math.min(mergeStart, this._intervals[i]![0])
      mergeEnd = Math.max(mergeEnd, this._intervals[i]![1])
      i++
    }

    result.push([mergeStart, mergeEnd])

    while (i < n) {
      result.push(this._intervals[i]!)
      i++
    }

    this._intervals = result
  }

  remove(start: number, end: number): void {
    if (start > end) {
      [start, end] = [end, start]
    }
    const result: [number, number][] = []
    const n = this._intervals.length!

    for (let i = 0; i < n; i++) {
      const interval = this._intervals[i]!
      const [s, e] = interval

      if (e < start) {
        result.push(interval)
      } else if (s > end) {
        result.push(interval)
      } else {
        if (s < start) {
          result.push([s, start - 1])
        }
        if (e > end) {
          result.push([end + 1, e])
        }
      }
    }

    this._intervals = result
  }

  has(start: number, end: number): boolean {
    if (start > end) {
      [start, end] = [end, start]
    }
    const n = this._intervals.length!
    for (let i = 0; i < n; i++) {
      const interval = this._intervals[i]!
      if (interval[0] === start && interval[1] === end) {
        return true
      }
    }
    return false
  }

  contains(point: number): boolean {
    const n = this._intervals.length!
    for (let i = 0; i < n; i++) {
      const interval = this._intervals[i]!
      if (interval[0] <= point && point <= interval[1]) {
        return true
      }
    }
    return false
  }

  overlaps(start: number, end: number): boolean {
    if (start > end) {
      [start, end] = [end, start]
    }
    const n = this._intervals.length!
    for (let i = 0; i < n; i++) {
      const interval = this._intervals[i]!
      if (interval[0] <= end && interval[1] >= start) {
        return true
      }
    }
    return false
  }

  intervals(): [number, number][] {
    return [...this._intervals]
  }

  size(): number {
    return this._intervals.length!
  }

  clear(): void {
    this._intervals = []
  }

  union(other: IntervalSet2): IntervalSet2 {
    const result = new IntervalSet2()
    const otherIntervals = other.intervals()
    const n = this._intervals.length!
    const m = otherIntervals.length!

    let i = 0
    let j = 0

    while (i < n && j < m) {
      const [s1, e1] = this._intervals[i]!
      const [s2, e2] = otherIntervals[j]!

      if (s1 < s2) {
        result.add(s1, e1)
        i++
      } else {
        result.add(s2, e2)
        j++
      }
    }

    while (i < n) {
      const [s, e] = this._intervals[i]!
      result.add(s, e)
      i++
    }

    while (j < m) {
      const [s, e] = otherIntervals[j]!
      result.add(s, e)
      j++
    }

    return result
  }

  totalLength(): number {
    let total = 0
    const n = this._intervals.length!
    for (let i = 0; i < n; i++) {
      const interval = this._intervals[i]!
      total += interval[1] - interval[0] + 1
    }
    return total
  }

  isEmpty(): boolean {
    return this.size() === 0
  }

  toString(): string {
    return `${IntervalSet2}({ size: ${this.size} })`
  }

  get [Symbol.toStringTag](): string {
    return 'IntervalSet2'
  }

  includes(point: number): boolean {
    return this.contains(point)
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
