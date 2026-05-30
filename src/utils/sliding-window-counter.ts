export class SlidingWindowCounter {
  private readonly buffer: Array<{ timestamp: number; count: number }>
  private head = 0
  private tail = 0
  private count = 0
  private readonly windowMs: number
  private readonly maxBuckets: number
  private total: number = 0

  constructor(windowMs: number, maxBuckets: number = 1000) {
    if (windowMs < 1) throw new RangeError(`windowMs must be >= 1, got ${windowMs}`)
    if (maxBuckets < 1) throw new RangeError(`maxBuckets must be >= 1, got ${maxBuckets}`)
    this.windowMs = windowMs
    this.maxBuckets = maxBuckets
    this.buffer = new Array(maxBuckets + 1)
  }

  public increment(count: number = 1): void {
    this.evict()
    const now = Date.now()
    if (this.count > 0) {
      const lastIdx = (this.tail - 1 + this.buffer.length) % this.buffer.length
      const last = this.buffer[lastIdx]
      if (last && last.timestamp === now) {
        last.count += count
        this.total += count
        return
      }
    }
    this.buffer[this.tail] = { timestamp: now, count }
    this.tail = (this.tail + 1) % this.buffer.length
    this.count++
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
    this.head = 0
    this.tail = 0
    this.count = 0
    this.total = 0
  }

  private evict(): void {
    const cutoff = Date.now() - this.windowMs
    while (this.count > 0 && this.buffer[this.head]!.timestamp < cutoff) {
      this.total -= this.buffer[this.head]!.count
      this.head = (this.head + 1) % this.buffer.length
      this.count--
    }
    while (this.count > this.maxBuckets) {
      this.total -= this.buffer[this.head]!.count
      this.head = (this.head + 1) % this.buffer.length
      this.count--
    }
  }
}
