export class SlidingWindowCounter {
  private readonly window: { timestamp: number; count: number }[] = []
  private readonly windowMs: number
  private readonly maxBuckets: number
  private total: number = 0

  constructor(windowMs: number, maxBuckets: number = 1000) {
    if (windowMs < 1) throw new RangeError(`windowMs must be >= 1, got ${windowMs}`)
    if (maxBuckets < 1) throw new RangeError(`maxBuckets must be >= 1, got ${maxBuckets}`)
    this.windowMs = windowMs
    this.maxBuckets = maxBuckets
  }

  public increment(count: number = 1): void {
    this.evict()
    const now = Date.now()
    const last = this.window[this.window.length - 1]
    if (last && last.timestamp === now) {
      last.count += count
    } else {
      this.window.push({ timestamp: now, count })
    }
    this.total += count
  }

  public getCount(): number {
    this.evict()
    return this.total
  }

  public getRate(): number {
    return this.getCount() / (this.windowMs / 1000)
  }

  public reset(): void {
    this.window.length = 0
    this.total = 0
  }

  private evict(): void {
    const cutoff = Date.now() - this.windowMs
    while (this.window.length > 0 && this.window[0]!.timestamp < cutoff) {
      const removed = this.window.shift()!
      this.total -= removed.count
    }
    while (this.window.length > this.maxBuckets) {
      const removed = this.window.shift()!
      this.total -= removed.count
    }
  }
}
