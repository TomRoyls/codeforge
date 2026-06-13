export class RateLimiter {
  private timestamps: number[] = []
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  tryAcquire(): boolean {
    const now = Date.now()
    this.prune(now)
    if (this.timestamps.length >= this.maxRequests) return false
    this.timestamps.push(now)
    return true
  }

  get remaining(): number {
    this.prune(Date.now())
    return Math.max(0, this.maxRequests - this.timestamps.length)
  }

  get isLimited(): boolean {
    this.prune(Date.now())
    return this.timestamps.length >= this.maxRequests
  }

  get resetIn(): number {
    if (this.timestamps.length === 0) return 0
    const oldest = this.timestamps[0]!
    return Math.max(0, this.windowMs - (Date.now() - oldest))
  }

  private prune(now: number): void {
    const cutoff = now - this.windowMs
    while (this.timestamps.length > 0 && this.timestamps[0]! < cutoff) {
      this.timestamps.shift()
    }
  }

  clear(): void {
    this.timestamps = []
  }

  toString(): string {
    return JSON.stringify({ remaining: this.remaining, maxRequests: this.maxRequests })
  }

  toJSON(): Record<string, unknown> {
    return { remaining: this.remaining, maxRequests: this.maxRequests, windowMs: this.windowMs, isLimited: this.isLimited }
  }

  clone(): RateLimiter {
    const copy = new RateLimiter(this.maxRequests, this.windowMs)
    copy.timestamps = [...this.timestamps]
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RateLimiter)) return false
    return this.maxRequests === other.maxRequests && this.windowMs === other.windowMs
  }
}
