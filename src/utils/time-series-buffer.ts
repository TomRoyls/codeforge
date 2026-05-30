export interface TimeSeriesEntry {
  timestamp: number
  value: number
}

export class TimeSeriesBuffer {
  private readonly entries: TimeSeriesEntry[] = []
  private sorted = true

  constructor(private readonly _maxSize: number = Infinity) {
    if (_maxSize < 1) throw new RangeError(`maxSize must be >= 1, got ${_maxSize}`)
  }

  push(timestamp: number, value: number): void {
    if (this._maxSize !== Infinity && this.entries.length >= this._maxSize) {
      this.entries.shift()
    }
    if (this.entries.length > 0 && timestamp < this.entries[this.entries.length - 1]!.timestamp) {
      this.sorted = false
    }
    this.entries.push({ timestamp, value })
  }

  queryRange(start: number, end: number): TimeSeriesEntry[] {
    this.ensureSorted()
    let lo = 0
    let hi = this.entries.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (this.entries[mid]!.timestamp < start) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    const result: TimeSeriesEntry[] = []
    for (let i = lo; i < this.entries.length; i++) {
      const entry = this.entries[i]!
      if (entry.timestamp > end) break
      result.push(entry)
    }
    return result
  }

  stats(start?: number, end?: number): { count: number; min: number; max: number; sum: number; mean: number } {
    const entries = start !== undefined && end !== undefined
      ? this.queryRange(start, end)
      : this.entries
    if (entries.length === 0) {
      return { count: 0, min: 0, max: 0, sum: 0, mean: 0 }
    }
    let min = Infinity
    let max = -Infinity
    let sum = 0
    for (const e of entries) {
      if (e.value < min) min = e.value
      if (e.value > max) max = e.value
      sum += e.value
    }
    return { count: entries.length, min, max, sum, mean: sum / entries.length }
  }

  get size(): number {
    return this.entries.length
  }

  get maxSize(): number {
    return this._maxSize
  }

  get isEmpty(): boolean {
    return this.entries.length === 0
  }

  clear(): void {
    this.entries.length = 0
    this.sorted = true
  }

  toArray(): TimeSeriesEntry[] {
    this.ensureSorted()
    return [...this.entries]
  }

  latest(): TimeSeriesEntry | undefined {
    if (this.entries.length === 0) return undefined
    this.ensureSorted()
    return this.entries[this.entries.length - 1]
  }

  earliest(): TimeSeriesEntry | undefined {
    if (this.entries.length === 0) return undefined
    this.ensureSorted()
    return this.entries[0]
  }

  merge(other: TimeSeriesBuffer): void {
    for (const entry of other.entries) {
      this.push(entry.timestamp, entry.value)
    }
  }

  private ensureSorted(): void {
    if (!this.sorted) {
      this.entries.sort((a, b) => a.timestamp - b.timestamp)
      this.sorted = true
    }
  }
}
