export class RateLimiter2 {
  private tokens: number
  private lastRefill: number
  private readonly maxTokens: number
  private readonly refillRate: number
  private readonly refillInterval: number

  constructor(maxTokens: number, refillIntervalMs: number) {
    this.maxTokens = maxTokens
    this.tokens = maxTokens
    this.refillRate = maxTokens
    this.refillInterval = refillIntervalMs
    this.lastRefill = Date.now()
  }

  tryAcquire(count = 1): boolean {
    this.refill()
    if (this.tokens >= count) {
      this.tokens -= count
      return true
    }
    return false
  }

  acquire(count = 1): void {
    while (!this.tryAcquire(count)) {
      const needed = count - this.tokens
      const waitMs = Math.ceil((needed / this.refillRate) * this.refillInterval)
      const start = Date.now()
      while (Date.now() - start < waitMs) {}
    }
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    const tokensToAdd = Math.floor(elapsed / this.refillInterval) * (this.refillRate / (1000 / this.refillInterval * 1000 / this.refillInterval))
    if (elapsed >= this.refillInterval) {
      const intervals = Math.floor(elapsed / this.refillInterval)
      const refilled = intervals * (this.maxTokens / (1000 / this.refillInterval))
      this.tokens = Math.min(this.maxTokens, this.tokens + intervals)
      this.lastRefill += intervals * this.refillInterval
    }
  }

  get availableTokens(): number { this.refill(); return Math.floor(this.tokens) }

  setTokens(n: number): void { this.tokens = Math.min(this.maxTokens, Math.max(0, n)) }

  reset(): void { this.tokens = this.maxTokens; this.lastRefill = Date.now() }
  clear(): void { this.tokens = this.maxTokens; this.lastRefill = Date.now() }

  toArray(): number[] { return [this.maxTokens, Math.floor(this.tokens)] }
  toString(): string { return JSON.stringify({ tokens: Math.floor(this.tokens), max: this.maxTokens }) }
  toJSON(): Record<string, number> { return { tokens: Math.floor(this.tokens), max: this.maxTokens } }
  clone(): RateLimiter2 { return new RateLimiter2(this.maxTokens, this.refillInterval) }
  equals(other: unknown): boolean { return other instanceof RateLimiter2 }
}
