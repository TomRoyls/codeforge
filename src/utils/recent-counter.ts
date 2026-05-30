export class RecentCounter {
  private readonly timestamps: number[] = []
  private idx = 0

  constructor(private readonly windowMs: number) {
    if (windowMs <= 0) throw new RangeError(`windowMs must be > 0, got ${windowMs}`)
  }

  ping(timestamp?: number): number {
    const now = timestamp ?? Date.now()
    this.timestamps.push(now)
    const threshold = now - this.windowMs
    while (this.idx < this.timestamps.length && this.timestamps[this.idx]! < threshold) {
      this.idx++
    }
    return this.timestamps.length - this.idx
  }

  count(timestamp?: number): number {
    const now = timestamp ?? Date.now()
    const threshold = now - this.windowMs
    let lo = this.idx
    let hi = this.timestamps.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (this.timestamps[mid]! >= threshold) {
        hi = mid
      } else {
        lo = mid + 1
      }
    }
    return this.timestamps.length - lo
  }

  reset(): void {
    this.timestamps.length = 0
    this.idx = 0
  }

  get windowSize(): number {
    return this.windowMs
  }

  get totalPings(): number {
    return this.timestamps.length
  }

  compact(): number {
    if (this.idx === 0) return 0
    const removed = this.idx
    this.timestamps.splice(0, this.idx)
    this.idx = 0
    return removed
  }
}
