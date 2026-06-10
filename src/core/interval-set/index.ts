import type { Interval, IntervalSetOptions, Comparator, DistanceFn } from './types.js'

export class IntervalSet<T = number> {
  private _intervals: Interval<T>[] = []
  private compare: Comparator<T>
  private dist: DistanceFn<T>

  constructor(options?: IntervalSetOptions<T>) {
    this.compare =
      options?.compare ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
    this.dist =
      options?.distance ??
      ((a: T, b: T) => (a as unknown as number) - (b as unknown as number))
  }

  add(start: T, end: T): void {
    if (this.compare(start, end) >= 0) return

    const result: Interval<T>[] = []
    let merged = false
    let newStart = start
    let newEnd = end

    for (const iv of this._intervals) {
      if (merged) {
        if (this.compare(iv.start, newEnd) <= 0) {
          if (this.compare(iv.end, newEnd) > 0) {
            newEnd = iv.end
          }
        } else {
          result.push(iv)
        }
      } else if (this.compare(iv.end, newStart) < 0) {
        result.push(iv)
      } else if (this.compare(iv.start, newEnd) > 0) {
        result.push({ start: newStart, end: newEnd })
        result.push(iv)
        merged = true
      } else {
        if (this.compare(iv.start, newStart) < 0) newStart = iv.start
        if (this.compare(iv.end, newEnd) > 0) newEnd = iv.end
      }
    }

    if (!merged) {
      result.push({ start: newStart, end: newEnd })
    }

    this._intervals = result
  }

  remove(start: T, end: T): void {
    if (this.compare(start, end) >= 0) return

    const result: Interval<T>[] = []

    for (const iv of this._intervals) {
      if (
        this.compare(iv.end, start) <= 0 ||
        this.compare(iv.start, end) >= 0
      ) {
        result.push(iv)
        continue
      }
      if (this.compare(iv.start, start) < 0) {
        result.push({ start: iv.start, end: start })
      }
      if (this.compare(iv.end, end) > 0) {
        result.push({ start: end, end: iv.end })
      }
    }

    this._intervals = result
  }

  private findIndexContaining(point: T): number {
    let lo = 0
    let hi = this._intervals.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const iv = this._intervals[mid]!
      if (this.compare(point, iv.start) < 0) {
        hi = mid - 1
      } else if (this.compare(point, iv.end) >= 0) {
        lo = mid + 1
      } else {
        return mid
      }
    }
    return -1
  }

  has(point: T): boolean {
    return this.findIndexContaining(point) >= 0
  }

  hasInterval(start: T, end: T): boolean {
    let lo = 0
    let hi = this._intervals.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const iv = this._intervals[mid]!
      const cmp = this.compare(iv.start, start)
      if (cmp < 0) lo = mid + 1
      else if (cmp > 0) hi = mid - 1
      else return this.compare(iv.end, end) === 0
    }
    return false
  }

  contains(start: T, end: T): boolean {
    if (this.compare(start, end) >= 0) return false
    const idx = this.findIndexContaining(start)
    if (idx < 0) return false
    const iv = this._intervals[idx]!
    return this.compare(iv.end, end) >= 0
  }

  overlaps(start: T, end: T): boolean {
    for (const iv of this._intervals) {
      if (this.compare(iv.start, end) >= 0) return false
      if (this.compare(iv.end, start) > 0) return true
    }
    return false
  }

  get size(): number {
    return this._intervals.length
  }

  isEmpty(): boolean {
    return this._intervals.length === 0
  }

  clear(): void {
    this._intervals = []
  }

  get intervals(): Interval<T>[] {
    return this._intervals.map((iv) => ({ start: iv.start, end: iv.end }))
  }

  union(other: IntervalSet<T>): IntervalSet<T> {
    const result = new IntervalSet<T>({
      compare: this.compare,
      distance: this.dist,
    })
    for (const iv of this._intervals) {
      result._intervals.push({ start: iv.start, end: iv.end })
    }
    for (const iv of other._intervals) {
      result.add(iv.start, iv.end)
    }
    return result
  }

  intersection(other: IntervalSet<T>): IntervalSet<T> {
    const result = new IntervalSet<T>({
      compare: this.compare,
      distance: this.dist,
    })
    let i = 0
    let j = 0
    while (i < this._intervals.length && j < other._intervals.length) {
      const a = this._intervals[i]!
      const b = other._intervals[j]!

      const overlapStart =
        this.compare(a.start, b.start) > 0 ? a.start : b.start
      const overlapEnd =
        this.compare(a.end, b.end) < 0 ? a.end : b.end

      if (this.compare(overlapStart, overlapEnd) < 0) {
        result._intervals.push({ start: overlapStart, end: overlapEnd })
      }

      if (this.compare(a.end, b.end) < 0) i++
      else j++
    }
    return result
  }

  difference(other: IntervalSet<T>): IntervalSet<T> {
    const result = new IntervalSet<T>({
      compare: this.compare,
      distance: this.dist,
    })
    for (const iv of this._intervals) {
      result.add(iv.start, iv.end)
    }
    for (const iv of other._intervals) {
      result.remove(iv.start, iv.end)
    }
    return result
  }

  complement(min: T, max: T): IntervalSet<T> {
    const result = new IntervalSet<T>({
      compare: this.compare,
      distance: this.dist,
    })
    let current = min
    for (const iv of this._intervals) {
      if (this.compare(iv.start, max) >= 0) break
      if (this.compare(current, iv.start) < 0) {
        result._intervals.push({ start: current, end: iv.start })
      }
      if (this.compare(iv.end, current) > 0) {
        current = iv.end
      }
    }
    if (this.compare(current, max) < 0) {
      result._intervals.push({ start: current, end: max })
    }
    return result
  }

  get length(): number {
    let total = 0
    for (const iv of this._intervals) {
      total += this.dist(iv.end, iv.start)
    }
    return total
  }

  forEach(callback: (interval: Interval<T>, index: number) => void): void {
    for (let i = 0; i < this._intervals.length; i++) {
      const iv = this._intervals[i]!
      callback({ start: iv.start, end: iv.end }, i)
    }
  }

  toArray(): Interval<T>[] {
    return this._intervals.map((iv) => ({ start: iv.start, end: iv.end }))
  }

  [Symbol.iterator](): Iterator<Interval<T>> {
    let idx = 0
    const intervals = this._intervals
    return {
      next: () => {
        if (idx < intervals.length) {
          const iv = intervals[idx]!
          idx++
          return { value: { start: iv.start, end: iv.end }, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<Interval<T>>
      },
    }
  }

  min(): T | undefined {
    if (this._intervals.length === 0) return undefined
    return this._intervals[0]!.start
  }

  max(): T | undefined {
    if (this._intervals.length === 0) return undefined
    return this._intervals[this._intervals.length - 1]!.end
  }

  gap(start: T, end: T): Interval<T> | undefined {
    const gapList = this.gaps(start, end)
    if (gapList.length === 0) return undefined
    let largest = gapList[0]!
    let largestLen = this.dist(largest.end, largest.start)
    for (let i = 1; i < gapList.length; i++) {
      const g = gapList[i]!
      const len = this.dist(g.end, g.start)
      if (len > largestLen) {
        largest = g
        largestLen = len
      }
    }
    return largest
  }

  gaps(start: T, end: T): Interval<T>[] {
    const result: Interval<T>[] = []
    let current = start
    for (const iv of this._intervals) {
      if (this.compare(iv.start, end) >= 0) break
      if (this.compare(current, iv.start) < 0) {
        const gapEnd =
          this.compare(iv.start, end) < 0 ? iv.start : end
        result.push({ start: current, end: gapEnd })
      }
      if (this.compare(iv.end, current) > 0) {
        current = this.compare(iv.end, end) < 0 ? iv.end : end
      }
    }
    if (this.compare(current, end) < 0) {
      result.push({ start: current, end })
    }
    return result
  }

  static from<T = number>(
    intervals: Array<[T, T]>,
    options?: IntervalSetOptions<T>,
  ): IntervalSet<T> {
    const s = new IntervalSet<T>(options)
    for (const [start, end] of intervals) {
      s.add(start, end)
    }
    return s
  }

  toString(): string {
    return `${IntervalSet}({ size: ${this.size} })`
  }


  toJSON() {
    return { type: 'IntervalSet', size: this.size, items: this.toArray() }
  }



  get [Symbol.toStringTag](): string {
    return 'IntervalSet'
  }

  includes(start: T, end: T): boolean {
    return this.contains(start, end)
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }
}
