export interface RangeMapEntry<V> {
  readonly start: number
  readonly end: number
  readonly value: V
}

export class RangeMap<V> {
  private entries: RangeMapEntry<V>[] = []

  set(start: number, end: number, value: V): void {
    if (start > end) {
      throw new RangeError(`start (${start}) must be <= end (${end})`)
    }
    this.remove(start, end)
    const entry: RangeMapEntry<V> = { start, end, value }
    let inserted = false
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i]!.start > start) {
        this.entries.splice(i, 0, entry)
        inserted = true
        break
      }
    }
    if (!inserted) {
      this.entries.push(entry)
    }
  }

  get(point: number): V | undefined {
    for (const entry of this.entries) {
      if (point >= entry.start && point <= entry.end) {
        return entry.value
      }
    }
    return undefined
  }

  has(point: number): boolean {
    return this.get(point) !== undefined
  }

  remove(start: number, end: number): number {
    let removed = 0
    for (let i = this.entries.length - 1; i >= 0; i--) {
      const entry = this.entries[i]!
      if (entry.start <= end && entry.end >= start) {
        this.entries.splice(i, 1)
        removed++
      }
    }
    return removed
  }

  clear(): void {
    this.entries = []
  }

  get size(): number {
    return this.entries.length
  }

  get isEmpty(): boolean {
    return this.entries.length === 0
  }

  getAll(): RangeMapEntry<V>[] {
    return [...this.entries]
  }

  findOverlapping(start: number, end: number): RangeMapEntry<V>[] {
    const result: RangeMapEntry<V>[] = []
    for (const entry of this.entries) {
      if (entry.start <= end && entry.end >= start) {
        result.push(entry)
      }
    }
    return result
  }

  forEach(callback: (entry: RangeMapEntry<V>, index: number) => void): void {
    this.entries.forEach((entry, i) => callback(entry, i))
  }

  coversEntireRange(start: number, end: number): boolean {
    let covered = 0
    for (const entry of this.entries) {
      if (entry.end < start || entry.start > end) continue
      const overlapStart = Math.max(entry.start, start)
      const overlapEnd = Math.min(entry.end, end)
      covered += overlapEnd - overlapStart + 1
    }
    return covered >= end - start + 1
  }

  totalCovered(): number {
    let total = 0
    for (const entry of this.entries) {
      total += entry.end - entry.start + 1
    }
    return total
  }

  clone(): RangeMap<V> {
    const copy = new RangeMap<V>()
    copy.entries = this.entries.map((e) => ({ ...e }))
    return copy
  }
}
