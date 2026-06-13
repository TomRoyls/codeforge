export class RangeIndex<T> {
  private entries: Array<{ start: number; end: number; value: T }> = []

  add(start: number, end: number, value: T): void {
    if (start > end) return
    this.entries.push({ start, end, value })
  }

  get(point: number): T[] {
    const results: T[] = []
    for (const e of this.entries) {
      if (point >= e.start && point <= e.end) results.push(e.value)
    }
    return results
  }

  queryRange(start: number, end: number): T[] {
    const results: T[] = []
    for (const e of this.entries) {
      if (e.start <= end && e.end >= start) results.push(e.value)
    }
    return results
  }

  get count(): number { return this.entries.length }
  get isEmpty(): boolean { return this.entries.length === 0 }

  clear(): void { this.entries = [] }

  toArray(): Array<{ start: number; end: number; value: T }> {
    return this.entries.map((e) => ({ start: e.start, end: e.end, value: e.value }))
  }

  toString(): string { return JSON.stringify({ count: this.count }) }
  toJSON(): Record<string, number> { return { count: this.count } }

  clone(): RangeIndex<T> {
    const c = new RangeIndex<T>()
    c.entries = this.entries.map((e) => ({ ...e }))
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RangeIndex)) return false
    return this.count === other.count
  }
}
