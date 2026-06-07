export type BoundKind = 'open' | 'closed'

export interface ContinuousInterval {
  readonly low: number
  readonly high: number
  readonly lowKind: BoundKind
  readonly highKind: BoundKind
}

export class IntervalSet {
  private intervals: ContinuousInterval[] = []

  add(interval: ContinuousInterval): void {
    if (!this.isValid(interval)) return
    const merged: ContinuousInterval[] = []
    let cur = { ...interval }
    let absorbed = false
    for (const iv of this.intervals) {
      if (this.strictlyBelow(iv, cur)) {
        merged.push(iv)
      } else if (this.strictlyAbove(iv, cur)) {
        if (!absorbed) {
          merged.push(cur)
          absorbed = true
        }
        merged.push(iv)
      } else {
        cur = this.mergePair(cur, iv)
      }
    }
    if (!absorbed) {
      merged.push(cur)
    }
    this.intervals = merged
  }

  remove(interval: ContinuousInterval): void {
    if (!this.isValid(interval)) return
    const result: ContinuousInterval[] = []
    for (const iv of this.intervals) {
      if (this.strictlyBelow(iv, interval) || this.strictlyAbove(iv, interval)) {
        result.push(iv)
        continue
      }
      const below = this.belowOverlap(iv, interval)
      const above = this.aboveOverlap(iv, interval)
      if (below) result.push(below)
      if (above) result.push(above)
    }
    this.intervals = result
  }

  contains(value: number): boolean {
    let lo = 0
    let hi = this.intervals.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const iv = this.intervals[mid]!
      if (this.valueInInterval(value, iv)) return true
      if (value < iv.low || (value === iv.low && iv.lowKind === 'open')) {
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    return false
  }

  get size(): number {
    return this.intervals.length
  }

  get isEmpty(): boolean {
    return this.intervals.length === 0
  }

  getIntervals(): ContinuousInterval[] {
    return [...this.intervals]
  }

  getTotalSpan(): number {
    if (this.intervals.length === 0) return 0
    const first = this.intervals[0]!
    const last = this.intervals[this.intervals.length - 1]!
    return last.high - first.low
  }

  getMin(): number | undefined {
    return this.intervals[0]?.low
  }

  getMax(): number | undefined {
    return this.intervals[this.intervals.length - 1]?.high
  }

  clear(): void {
    this.intervals = []
  }

  clone(): IntervalSet {
    const copy = new IntervalSet()
    copy.intervals = this.intervals.map((iv) => ({ ...iv }))
    return copy
  }

  toString(): string {
    return `IntervalSet(${this.intervals.length})`
  }

  toJSON(): unknown {
    return this.intervals.map(iv => ({ low: iv.low, high: iv.high, lowKind: iv.lowKind, highKind: iv.highKind }))
  }

  equals(other: unknown): boolean {
    if (!(other instanceof IntervalSet)) return false
    if (this.intervals.length !== other.intervals.length) return false
    for (let i = 0; i < this.intervals.length; i++) {
      const a = this.intervals[i]!
      const b = other.intervals[i]!
      if (a.low !== b.low || a.high !== b.high) return false
      if (a.lowKind !== b.lowKind || a.highKind !== b.highKind) return false
    }
    return true
  }

  complement(low: number, high: number): IntervalSet {
    const result = new IntervalSet()
    let prev = low
    for (const iv of this.intervals) {
      if (iv.low > prev) {
        result.add({ low: prev, high: iv.low, lowKind: 'closed', highKind: iv.lowKind === 'closed' ? 'open' : 'closed' })
      }
      prev = iv.high
    }
    if (prev < high) {
      result.add({ low: prev, high, lowKind: 'closed', highKind: 'closed' })
    }
    return result
  }

  union(other: IntervalSet): IntervalSet {
    const result = this.clone()
    for (const iv of other.intervals) {
      result.add(iv)
    }
    return result
  }

  intersection(other: IntervalSet): IntervalSet {
    const result = new IntervalSet()
    for (const a of this.intervals) {
      for (const b of other.intervals) {
        const inter = this.intersectPair(a, b)
        if (inter) result.add(inter)
      }
    }
    return result
  }

  difference(other: IntervalSet): IntervalSet {
    const result = this.clone()
    for (const iv of other.intervals) {
      result.remove(iv)
    }
    return result
  }

  forEach(callback: (interval: ContinuousInterval, index: number) => void): void {
    this.intervals.forEach((iv, i) => callback(iv, i))
  }

  overlaps(interval: ContinuousInterval): boolean {
    for (const iv of this.intervals) {
      if (this.intervalsOverlap(iv, interval)) return true
      if (iv.low > interval.high) break
    }
    return false
  }

  private isValid(iv: ContinuousInterval): boolean {
    if (iv.low > iv.high) return false
    if (iv.low === iv.high && (iv.lowKind === 'open' || iv.highKind === 'open')) return false
    return true
  }

  private valueInInterval(value: number, iv: ContinuousInterval): boolean {
    const aboveLow = iv.lowKind === 'closed' ? value >= iv.low : value > iv.low
    const belowHigh = iv.highKind === 'closed' ? value <= iv.high : value < iv.high
    return aboveLow && belowHigh
  }

  private strictlyBelow(a: ContinuousInterval, b: ContinuousInterval): boolean {
    if (a.high < b.low) return true
    if (a.high === b.low) return a.highKind === 'open' || b.lowKind === 'open'
    return false
  }

  private strictlyAbove(a: ContinuousInterval, b: ContinuousInterval): boolean {
    if (a.low > b.high) return true
    if (a.low === b.high) return a.lowKind === 'open' || b.highKind === 'open'
    return false
  }

  private mergePair(a: ContinuousInterval, b: ContinuousInterval): ContinuousInterval {
    const low = Math.min(a.low, b.low)
    const high = Math.max(a.high, b.high)
    let lowKind: BoundKind
    let highKind: BoundKind
    if (a.low < b.low) {
      lowKind = a.lowKind
    } else if (b.low < a.low) {
      lowKind = b.lowKind
    } else {
      lowKind = a.lowKind === 'closed' || b.lowKind === 'closed' ? 'closed' : 'open'
    }
    if (a.high > b.high) {
      highKind = a.highKind
    } else if (b.high > a.high) {
      highKind = b.highKind
    } else {
      highKind = a.highKind === 'closed' || b.highKind === 'closed' ? 'closed' : 'open'
    }
    return { low, high, lowKind, highKind }
  }

  private intersectPair(a: ContinuousInterval, b: ContinuousInterval): ContinuousInterval | null {
    const low = Math.max(a.low, b.low)
    const high = Math.min(a.high, b.high)
    if (low > high) return null
    if (low === high) {
      const bothClosed = this.valueInInterval(low, a) && this.valueInInterval(low, b)
      if (!bothClosed) return null
    }
    let lowKind: BoundKind
    let highKind: BoundKind
    if (a.low > b.low) {
      lowKind = a.lowKind
    } else if (b.low > a.low) {
      lowKind = b.lowKind
    } else {
      lowKind = a.lowKind === 'closed' && b.lowKind === 'closed' ? 'closed' : 'open'
    }
    if (a.high < b.high) {
      highKind = a.highKind
    } else if (b.high < a.high) {
      highKind = b.highKind
    } else {
      highKind = a.highKind === 'closed' && b.highKind === 'closed' ? 'closed' : 'open'
    }
    const result: ContinuousInterval = { low, high, lowKind, highKind }
    return this.isValid(result) ? result : null
  }

  private belowOverlap(iv: ContinuousInterval, removal: ContinuousInterval): ContinuousInterval | null {
    const low = iv.low
    const lowKind = iv.lowKind
    const high = removal.low
    let highKind: BoundKind
    if (removal.lowKind === 'open') {
      highKind = 'closed'
    } else {
      highKind = 'open'
    }
    const result: ContinuousInterval = { low, high, lowKind, highKind }
    return this.isValid(result) ? result : null
  }

  private aboveOverlap(iv: ContinuousInterval, removal: ContinuousInterval): ContinuousInterval | null {
    const low = removal.high
    let lowKind: BoundKind
    if (removal.highKind === 'open') {
      lowKind = 'closed'
    } else {
      lowKind = 'open'
    }
    const high = iv.high
    const highKind = iv.highKind
    const result: ContinuousInterval = { low, high, lowKind, highKind }
    return this.isValid(result) ? result : null
  }

  private intervalsOverlap(a: ContinuousInterval, b: ContinuousInterval): boolean {
    return !this.strictlyBelow(a, b) && !this.strictlyAbove(a, b)
  }
}
