export class MergeInterval {
  private intervals: Array<[number, number]> = []

  add(start: number, end: number): void {
    if (start > end) return
    this.intervals.push([start, end])
    this.intervals.sort((a, b) => a[0] - b[0])
    this.mergeAll()
  }

  private mergeAll(): void {
    if (this.intervals.length <= 1) return
    const result: Array<[number, number]> = [this.intervals[0]!]
    for (let i = 1; i < this.intervals.length; i++) {
      const last = result[result.length - 1]!
      const curr = this.intervals[i]!
      if (curr[0] <= last[1] + 1) last[1] = Math.max(last[1], curr[1])
      else result.push(curr)
    }
    this.intervals = result
  }

  count(): number { return this.intervals.length }
  totalLength(): number { return this.intervals.reduce((s, [a, b]) => s + (b - a + 1), 0) }

  overlaps(start: number, end: number): boolean {
    return this.intervals.some(([s, e]) => s <= end && e >= start)
  }

  contains(point: number): boolean {
    return this.intervals.some(([s, e]) => point >= s && point <= e)
  }

  get isEmpty(): boolean { return this.intervals.length === 0 }

  clear(): void { this.intervals = [] }

  toArray(): Array<[number, number]> { return [...this.intervals] }
  toString(): string { return JSON.stringify(this.intervals) }
  toJSON(): Array<[number, number]> { return this.intervals }

  clone(): MergeInterval {
    const c = new MergeInterval()
    c.intervals = this.intervals.map(([a, b]) => [a, b] as [number, number])
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof MergeInterval)) return false
    if (this.intervals.length !== other.intervals.length) return false
    return this.intervals.every(([s, e], i) => other.intervals[i]?.[0] === s && other.intervals[i]?.[1] === e)
  }
}
