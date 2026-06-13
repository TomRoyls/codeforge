export class RateTracker {
  private timestamps: number[] = []
  private windowMs: number

  constructor(windowMs = 60000) {
    this.windowMs = windowMs
  }

  record(timestamp?: number): void {
    const ts = timestamp ?? Date.now()
    this.timestamps.push(ts)
    this.trim(ts)
  }

  rate(): number {
    if (this.timestamps.length < 2) return 0
    this.trim(Date.now())
    if (this.timestamps.length < 2) return 0
    const duration = this.timestamps[this.timestamps.length - 1]! - this.timestamps[0]!
    if (duration === 0) return 0
    return (this.timestamps.length - 1) / (duration / 1000)
  }

  count(): number {
    this.trim(Date.now())
    return this.timestamps.length
  }

  get isEmpty(): boolean { return this.timestamps.length === 0 }

  private trim(now: number): void {
    const cutoff = now - this.windowMs
    while (this.timestamps.length > 0 && this.timestamps[0]! < cutoff) {
      this.timestamps.shift()
    }
  }

  clear(): void { this.timestamps = [] }

  toArray(): number[] { return [...this.timestamps] }
  toString(): string { return JSON.stringify({ count: this.count(), windowMs: this.windowMs }) }
  toJSON(): Record<string, number> { return { count: this.count(), windowMs: this.windowMs } }

  clone(): RateTracker {
    const c = new RateTracker(this.windowMs)
    c.timestamps = [...this.timestamps]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RateTracker)) return false
    return this.windowMs === other.windowMs
  }
}
