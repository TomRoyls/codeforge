/**
 * DisjointIntervalMap — a map over non-overlapping integer intervals.
 * Maintains a sorted set of [lo, hi] → value pairs where no two intervals overlap.
 * Inserting a new interval merges or displaces existing overlapping intervals.
 * O(log n) lookup via binary search on sorted interval starts.
 */

interface IntervalEntry<V> {
  lo: number
  hi: number
  value: V
}

export class DisjointIntervalMap<V> {
  private intervals: IntervalEntry<V>[] = []

  set(lo: number, hi: number, value: V): void {
    if (lo > hi) {
      throw new RangeError(`lo (${lo}) must be <= hi (${hi})`)
    }
    const kept: IntervalEntry<V>[] = []
    for (const iv of this.intervals) {
      if (iv.hi < lo || iv.lo > hi) {
        kept.push(iv)
      }
    }
    kept.push({ lo, hi, value })
    kept.sort((a, b) => a.lo - b.lo)
    this.intervals = kept
  }

  get(point: number): V | undefined {
    let lo = 0
    let hi = this.intervals.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const iv = this.intervals[mid]!
      if (point >= iv.lo && point <= iv.hi) {
        return iv.value
      }
      if (point < iv.lo) {
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    return undefined
  }

  has(point: number): boolean {
    return this.get(point) !== undefined
  }

  getInterval(point: number): { lo: number; hi: number; value: V } | undefined {
    let lo = 0
    let hi = this.intervals.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const iv = this.intervals[mid]!
      if (point >= iv.lo && point <= iv.hi) {
        return { lo: iv.lo, hi: iv.hi, value: iv.value }
      }
      if (point < iv.lo) {
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    return undefined
  }

  delete(lo: number, hi: number): number {
    if (lo > hi) return 0
    const before = this.intervals.length
    this.intervals = this.intervals.filter((iv) => iv.hi < lo || iv.lo > hi)
    return before - this.intervals.length
  }

  deletePoint(point: number): boolean {
    const before = this.intervals.length
    this.intervals = this.intervals.filter(
      (iv) => !(point >= iv.lo && point <= iv.hi),
    )
    return this.intervals.length < before
  }

  merge(other: DisjointIntervalMap<V>): void {
    for (const iv of other.intervals) {
      this.set(iv.lo, iv.hi, iv.value)
    }
  }

  split(point: number): void {
    const idx = this.findIndex(point)
    if (idx === -1) return
    const iv = this.intervals[idx]!
    if (iv.lo === iv.hi) return
    const left: IntervalEntry<V> = { lo: iv.lo, hi: point - 1, value: iv.value }
    const right: IntervalEntry<V> = { lo: point + 1, hi: iv.hi, value: iv.value }
    this.intervals.splice(idx, 1)
    if (left.lo <= left.hi) this.intervals.splice(idx, 0, left)
    const insertAt = left.lo <= left.hi ? idx + 1 : idx
    if (right.lo <= right.hi) this.intervals.splice(insertAt, 0, right)
  }

  get size(): number {
    return this.intervals.length
  }

  isEmpty(): boolean {
    return this.intervals.length === 0
  }

  clear(): void {
    this.intervals = []
  }

  getAll(): Array<{ lo: number; hi: number; value: V }> {
    return this.intervals.map((iv) => ({ lo: iv.lo, hi: iv.hi, value: iv.value }))
  }

  totalCovered(): number {
    let total = 0
    for (const iv of this.intervals) {
      total += iv.hi - iv.lo + 1
    }
    return total
  }

  covers(point: number): boolean {
    return this.has(point)
  }

  coversRange(lo: number, hi: number): boolean {
    for (let p = lo; p <= hi; p++) {
      if (!this.has(p)) return false
    }
    return true
  }

  findOverlapping(lo: number, hi: number): Array<{ lo: number; hi: number; value: V }> {
    return this.intervals
      .filter((iv) => iv.lo <= hi && iv.hi >= lo)
      .map((iv) => ({ lo: iv.lo, hi: iv.hi, value: iv.value }))
  }

  forEach(callback: (lo: number, hi: number, value: V) => void): void {
    for (const iv of this.intervals) {
      callback(iv.lo, iv.hi, iv.value)
    }
  }

  clone(): DisjointIntervalMap<V> {
    const copy = new DisjointIntervalMap<V>()
    for (const iv of this.intervals) {
      copy.intervals.push({ lo: iv.lo, hi: iv.hi, value: iv.value })
    }
    return copy
  }

  private findIndex(point: number): number {
    let lo = 0
    let hi = this.intervals.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const iv = this.intervals[mid]!
      if (point >= iv.lo && point <= iv.hi) return mid
      if (point < iv.lo) hi = mid - 1
      else lo = mid + 1
    }
    return -1
  }

  toString(): string {
    return `DisjointIntervalMap(${this.intervals.length} entries)`
  }

  toJSON(): Array<{ lo: number; hi: number; value: V }> {
    return this.getAll()
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DisjointIntervalMap)) return false
    if (this.intervals.length !== other.intervals.length) return false
    for (let i = 0; i < this.intervals.length; i++) {
      if (this.intervals[i]!.lo !== other.intervals[i]!.lo) return false
      if (this.intervals[i]!.hi !== other.intervals[i]!.hi) return false
      if (this.intervals[i]!.value !== other.intervals[i]!.value) return false
    }
    return true
  }
}
