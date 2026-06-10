import type { Interval, IntervalOptions } from './types.js'
import { DEFAULT_COMPARATOR } from './types.js'

export class DisjointIntervalSet {
  private _intervals: Interval[] = []
  private _cmp: (a: number, b: number) => number

  constructor(options?: IntervalOptions) {
    this._cmp = options?.comparator ?? DEFAULT_COMPARATOR
  }

  add(from: number, to: number): void {
    if (this._cmp(from, to) >= 0) return

    const merged: Interval[] = []
    let newFrom = from
    let newTo = to
    let inserted = false

    for (let i = 0; i < this._intervals.length; i++) {
      const iv = this._intervals[i]!
      if (!inserted && this._cmp(newTo, iv[0]) < 0) {
        merged.push([newFrom, newTo])
        inserted = true
      }
      if (
        this._cmp(iv[1], newFrom) < 0 ||
        this._cmp(newTo, iv[0]) < 0
      ) {
        if (!inserted || this._cmp(iv[0], newTo) > 0) {
          merged.push(iv)
        }
        continue
      }
      newFrom = this._cmp(newFrom, iv[0]) < 0 ? newFrom : iv[0]
      newTo = this._cmp(newTo, iv[1]) > 0 ? newTo : iv[1]
    }

    if (!inserted) {
      merged.push([newFrom, newTo])
    }

    this._intervals = merged
  }

  remove(from: number, to: number): void {
    if (this._cmp(from, to) >= 0) return

    const result: Interval[] = []
    for (const iv of this._intervals) {
      if (this._cmp(iv[1], from) <= 0 || this._cmp(iv[0], to) >= 0) {
        result.push(iv)
        continue
      }
      if (this._cmp(iv[0], from) < 0) {
        result.push([iv[0], from])
      }
      if (this._cmp(iv[1], to) > 0) {
        result.push([to, iv[1]])
      }
    }
    this._intervals = result
  }

  contains(point: number): boolean {
    for (const iv of this._intervals) {
      if (this._cmp(iv[0], point) <= 0 && this._cmp(point, iv[1]) < 0) {
        return true
      }
    }
    return false
  }

  containsInterval(from: number, to: number): boolean {
    if (this._cmp(from, to) >= 0) return false
    for (const iv of this._intervals) {
      if (this._cmp(iv[0], from) <= 0 && this._cmp(iv[1], to) >= 0) {
        return true
      }
    }
    return false
  }

  overlaps(from: number, to: number): boolean {
    if (this._cmp(from, to) >= 0) return false
    for (const iv of this._intervals) {
      if (this._cmp(iv[0], to) < 0 && this._cmp(iv[1], from) > 0) {
        return true
      }
    }
    return false
  }

  intervals(): Interval[] {
    return this._intervals.map((iv) => [iv[0], iv[1]] as Interval)
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

  clone(): DisjointIntervalSet {
    const cloned = new DisjointIntervalSet({ comparator: this._cmp })
    cloned._intervals = this.intervals()
    return cloned
  }

  union(other: DisjointIntervalSet): DisjointIntervalSet {
    const result = this.clone()
    for (const iv of other._intervals) {
      result.add(iv[0], iv[1])
    }
    return result
  }

  intersect(other: DisjointIntervalSet): DisjointIntervalSet {
    const result = new DisjointIntervalSet({ comparator: this._cmp })
    let i = 0
    let j = 0
    while (i < this._intervals.length && j < other._intervals.length) {
      const a = this._intervals[i]!
      const b = other._intervals[j]!
      const lo = this._cmp(a[0], b[0]) > 0 ? a[0] : b[0]
      const hi = this._cmp(a[1], b[1]) < 0 ? a[1] : b[1]
      if (this._cmp(lo, hi) < 0) {
        result._intervals.push([lo, hi])
      }
      if (this._cmp(a[1], b[1]) < 0) {
        i++
      } else {
        j++
      }
    }
    return result
  }

  difference(other: DisjointIntervalSet): DisjointIntervalSet {
    const result = this.clone()
    for (const iv of other._intervals) {
      result.remove(iv[0], iv[1])
    }
    return result
  }

  complement(min: number, max: number): DisjointIntervalSet {
    if (this._cmp(min, max) >= 0) {
      return new DisjointIntervalSet({ comparator: this._cmp })
    }
    const result = new DisjointIntervalSet({ comparator: this._cmp })
    let current = min
    for (const iv of this._intervals) {
      if (this._cmp(iv[0], max) >= 0) break
      if (this._cmp(current, iv[0]) < 0) {
        result._intervals.push([current, iv[0]])
      }
      current = this._cmp(iv[1], current) > 0 ? iv[1] : current
    }
    if (this._cmp(current, max) < 0) {
      result._intervals.push([current, max])
    }
    return result
  }

  gaps(min: number, max: number): DisjointIntervalSet {
    return this.complement(min, max)
  }

  get length(): number {
    let total = 0
    for (const iv of this._intervals) {
      total += iv[1] - iv[0]
    }
    return total
  }

  forEach(callback: (from: number, to: number, index: number) => void): void {
    for (let i = 0; i < this._intervals.length; i++) {
      const iv = this._intervals[i]!
      callback(iv[0], iv[1], i)
    }
  }

  *[Symbol.iterator](): Iterator<Interval> {
    for (const iv of this._intervals) {
      yield [iv[0], iv[1]] as Interval
    }
  }

  static fromIntervals(intervals: Iterable<Interval>, options?: IntervalOptions): DisjointIntervalSet {
    const set = new DisjointIntervalSet(options)
    for (const [from, to] of intervals) {
      set.add(from, to)
    }
    return set
  }

  min(): number | undefined {
    if (this._intervals.length === 0) return undefined
    return this._intervals[0]![0]
  }

  max(): number | undefined {
    if (this._intervals.length === 0) return undefined
    return this._intervals[this._intervals.length - 1]![1]
  }

  encloses(from: number, to: number): boolean {
    return this.containsInterval(from, to)
  }

  equals(other: DisjointIntervalSet): boolean {
    if (this._intervals.length !== other._intervals.length) return false
    for (let i = 0; i < this._intervals.length; i++) {
      const a = this._intervals[i]!
      const b = other._intervals[i]!
      if (a[0] !== b[0] || a[1] !== b[1]) return false
    }
    return true
  }

  expand(point: number): void {
    this.add(point, point + 1)
  }

  intersectPoint(point: number): number | undefined {
    for (const iv of this._intervals) {
      if (this._cmp(iv[0], point) <= 0 && this._cmp(point, iv[1]) < 0) {
        return point
      }
    }
    return undefined
  }
  toArray() {
    return [...this]
  }

  toString(): string {
    return `${DisjointIntervalSet}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  has(point: number): boolean {
    return this.contains(point)
  }

  toJSON() {
    return { type: 'DisjointIntervalSet', size: this.size, items: this.toArray() }
  }

  static empty(): DisjointIntervalSet {
    return new DisjointIntervalSet()
  }

  get [Symbol.toStringTag](): string {
    return 'DisjointIntervalSet'
  }

  includes(point: number): boolean {
    return this.contains(point)
  }
}

export type { Interval, IntervalOptions }
