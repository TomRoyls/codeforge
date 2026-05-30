export class IntegerIntervalTree<T> {
  private entries: Array<{ lo: number; hi: number; value: T }> = []
  private sorted = false

  insert(lo: number, hi: number, value: T): void {
    if (lo > hi) return
    this.entries.push({ lo, hi, value })
    this.sorted = false
  }

  queryPoint(point: number): Array<{ lo: number; hi: number; value: T }> {
    this.ensureSorted()
    const results: Array<{ lo: number; hi: number; value: T }> = []
    for (const entry of this.entries) {
      if (entry.lo > point) break
      if (point >= entry.lo && point <= entry.hi) {
        results.push(entry)
      }
    }
    return results
  }

  queryRange(lo: number, hi: number): Array<{ lo: number; hi: number; value: T }> {
    this.ensureSorted()
    const results: Array<{ lo: number; hi: number; value: T }> = []
    for (const entry of this.entries) {
      if (entry.lo > hi) break
      if (entry.lo <= hi && entry.hi >= lo) {
        results.push(entry)
      }
    }
    return results
  }

  contains(point: number): boolean {
    return this.queryPoint(point).length > 0
  }

  coversRange(lo: number, hi: number): boolean {
    this.ensureSorted()
    let covered = lo
    for (const entry of this.entries) {
      if (entry.lo > covered) break
      if (entry.lo <= covered && entry.hi >= covered) {
        covered = entry.hi + 1
        if (covered > hi) return true
      }
    }
    return covered > hi
  }

  remove(lo: number, hi: number): number {
    const before = this.entries.length
    this.entries = this.entries.filter(e => !(e.lo === lo && e.hi === hi))
    return before - this.entries.length
  }

  union(other: IntegerIntervalTree<T>): IntegerIntervalTree<T> {
    const result = new IntegerIntervalTree<T>()
    for (const e of this.entries) result.insert(e.lo, e.hi, e.value)
    for (const e of other.entries) result.insert(e.lo, e.hi, e.value)
    return result
  }

  get size(): number {
    return this.entries.length
  }

  toArray(): Array<{ lo: number; hi: number; value: T }> {
    this.ensureSorted()
    return this.entries.map(e => ({ ...e }))
  }

  private ensureSorted(): void {
    if (!this.sorted) {
      this.entries.sort((a, b) => a.lo - b.lo || a.hi - b.hi)
      this.sorted = true
    }
  }
}
