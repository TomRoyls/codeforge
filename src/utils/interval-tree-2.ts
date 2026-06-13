export class IntervalTree2 {
  private intervals: Array<{ lo: number; hi: number; data?: unknown }> = []

  insert(lo: number, hi: number, data?: unknown): void {
    if (lo > hi) return
    this.intervals.push({ lo, hi, data })
  }

  queryPoint(point: number): Array<{ lo: number; hi: number; data?: unknown }> {
    return this.intervals.filter((i) => point >= i.lo && point <= i.hi)
  }

  queryRange(lo: number, hi: number): Array<{ lo: number; hi: number; data?: unknown }> {
    return this.intervals.filter((i) => i.lo <= hi && i.hi >= lo)
  }

  remove(lo: number, hi: number): number {
    const before = this.intervals.length
    this.intervals = this.intervals.filter((i) => i.lo !== lo || i.hi !== hi)
    return before - this.intervals.length
  }

  get count(): number { return this.intervals.length }
  get isEmpty(): boolean { return this.intervals.length === 0 }

  clear(): void { this.intervals = [] }

  toArray(): Array<{ lo: number; hi: number }> {
    return this.intervals.map(({ lo, hi }) => ({ lo, hi }))
  }

  toString(): string { return JSON.stringify({ count: this.intervals.length }) }
  toJSON(): Record<string, number> { return { count: this.intervals.length } }

  clone(): IntervalTree2 {
    const c = new IntervalTree2()
    c.intervals = this.intervals.map((i) => ({ ...i }))
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof IntervalTree2)) return false
    return this.count === other.count
  }
}
