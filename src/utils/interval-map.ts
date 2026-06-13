export class IntervalMap<V> {
  private intervals: Array<{ low: number; high: number; value: V }> = []

  add(low: number, high: number, value: V): void {
    if (low > high) [low, high] = [high, low]
    this.intervals.push({ low, high, value })
  }

  get(point: number): V[] {
    return this.intervals.filter((iv) => point >= iv.low && point <= iv.high).map((iv) => iv.value)
  }

  getOverlapping(low: number, high: number): V[] {
    return this.intervals.filter((iv) => iv.low <= high && iv.high >= low).map((iv) => iv.value)
  }

  getEnclosing(low: number, high: number): V[] {
    return this.intervals.filter((iv) => iv.low <= low && iv.high >= high).map((iv) => iv.value)
  }

  get count(): number {
    return this.intervals.length
  }

  get isEmpty(): boolean {
    return this.intervals.length === 0
  }

  compact(): void {
    this.intervals.sort((a, b) => a.low - b.low || a.high - b.high)
  }

  remove(index: number): boolean {
    if (index < 0 || index >= this.intervals.length) return false
    this.intervals.splice(index, 1)
    return true
  }

  clear(): void {
    this.intervals = []
  }

  toArray(): Array<{ low: number; high: number; value: V }> {
    return this.intervals.map((iv) => ({ ...iv }))
  }

  toString(): string {
    return JSON.stringify(this.intervals.map((iv) => [iv.low, iv.high]))
  }

  toJSON(): Array<{ low: number; high: number; value: V }> {
    return this.toArray()
  }

  clone(): IntervalMap<V> {
    const copy = new IntervalMap<V>()
    copy.intervals = this.intervals.map((iv) => ({ ...iv }))
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof IntervalMap)) return false
    return this.count === other.count
  }
}
