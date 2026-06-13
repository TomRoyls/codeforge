export class DisjointIntervalSetNew {
  private intervals: Array<{ low: number; high: number }> = []

  add(low: number, high: number): void {
    if (low > high) [low, high] = [high, low]
    this.intervals.push({ low, high })
    this.mergeAll()
  }

  private mergeAll(): void {
    this.intervals.sort((a, b) => a.low - b.low)
    const merged: Array<{ low: number; high: number }> = []
    for (const iv of this.intervals) {
      if (merged.length > 0 && iv.low <= merged[merged.length - 1]!.high + 1) {
        merged[merged.length - 1]!.high = Math.max(merged[merged.length - 1]!.high, iv.high)
      } else {
        merged.push({ ...iv })
      }
    }
    this.intervals = merged
  }

  contains(point: number): boolean {
    for (const iv of this.intervals) {
      if (point >= iv.low && point <= iv.high) return true
    }
    return false
  }

  overlaps(low: number, high: number): boolean {
    for (const iv of this.intervals) {
      if (iv.low <= high && iv.high >= low) return true
    }
    return false
  }

  remove(low: number, high: number): void {
    const result: Array<{ low: number; high: number }> = []
    for (const iv of this.intervals) {
      if (iv.high < low || iv.low > high) {
        result.push(iv)
      } else {
        if (iv.low < low) result.push({ low: iv.low, high: low - 1 })
        if (iv.high > high) result.push({ low: high + 1, high: iv.high })
      }
    }
    this.intervals = result
  }

  get totalSize(): number {
    return this.intervals.reduce((sum, iv) => sum + (iv.high - iv.low + 1), 0)
  }

  get count(): number {
    return this.intervals.length
  }

  get isEmpty(): boolean {
    return this.intervals.length === 0
  }

  clear(): void {
    this.intervals = []
  }

  toArray(): Array<[number, number]> {
    return this.intervals.map((iv) => [iv.low, iv.high])
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): Array<[number, number]> {
    return this.toArray()
  }

  clone(): DisjointIntervalSetNew {
    const copy = new DisjointIntervalSetNew()
    copy.intervals = this.intervals.map((iv) => ({ ...iv }))
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof DisjointIntervalSetNew)) return false
    return this.count === other.count
  }
}
