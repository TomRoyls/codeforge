export interface RateLimiterOptions {
  maxTokens: number
  refillRate: number
  refillIntervalMs: number
}

interface RateLimiterStats {
  totalAcquired: number
  totalRejected: number
  availableTokens: number
  maxTokens: number
  totalRefills: number
}

export class RateLimiter {
  readonly maxTokens: number
  readonly refillRate: number
  readonly refillIntervalMs: number
  private tokens: number
  private lastRefillTime: number
  private totalAcquired = 0
  private totalRejected = 0
  private totalRefills = 0

  constructor(options: RateLimiterOptions) {
    if (options.maxTokens < 1) {
      throw new RangeError('maxTokens must be >= 1')
    }
    if (options.refillRate < 1) {
      throw new RangeError('refillRate must be >= 1')
    }
    if (options.refillIntervalMs < 1) {
      throw new RangeError('refillIntervalMs must be >= 1')
    }
    this.maxTokens = options.maxTokens
    this.refillRate = options.refillRate
    this.refillIntervalMs = options.refillIntervalMs
    this.tokens = options.maxTokens
    this.lastRefillTime = Date.now()
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefillTime
    const intervals = Math.floor(elapsed / this.refillIntervalMs)
    if (intervals > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + intervals * this.refillRate)
      this.lastRefillTime += intervals * this.refillIntervalMs
      this.totalRefills++
    }
  }

  tryAcquire(count?: number): boolean {
    const n = count ?? 1
    if (n < 1) {
      throw new RangeError('count must be >= 1')
    }
    this.refill()
    if (this.tokens >= n) {
      this.tokens -= n
      this.totalAcquired += n
      return true
    }
    this.totalRejected++
    return false
  }

  async acquire(): Promise<void> {
    while (!this.tryAcquire()) {
      const needed = 1 - this.tokens
      const waitMs = Math.ceil((needed / this.refillRate) * this.refillIntervalMs)
      await new Promise((resolve) => setTimeout(resolve, Math.max(1, waitMs)))
    }
  }

  getAvailableTokens(): number {
    this.refill()
    return this.tokens
  }

  getStats(): RateLimiterStats {
    this.refill()
    return {
      totalAcquired: this.totalAcquired,
      totalRejected: this.totalRejected,
      availableTokens: this.tokens,
      maxTokens: this.maxTokens,
      totalRefills: this.totalRefills,
    }
  }

  reset(): void {
    this.tokens = this.maxTokens
    this.lastRefillTime = Date.now()
    this.totalAcquired = 0
    this.totalRejected = 0
    this.totalRefills = 0
  }

  toString(): string {
    return `RateLimiter(maxTokens: ${this.maxTokens}, refillRate: ${this.refillRate}, refillIntervalMs: ${this.refillIntervalMs})`
  }

  toJSON(): RateLimiterOptions & { tokens: number } {
    return {
      maxTokens: this.maxTokens,
      refillRate: this.refillRate,
      refillIntervalMs: this.refillIntervalMs,
      tokens: this.tokens,
    }
  }

  clone(): RateLimiter {
    const copy = new RateLimiter({
      maxTokens: this.maxTokens,
      refillRate: this.refillRate,
      refillIntervalMs: this.refillIntervalMs,
    })
    copy.tokens = this.tokens
    copy.lastRefillTime = this.lastRefillTime
    copy.totalAcquired = this.totalAcquired
    copy.totalRejected = this.totalRejected
    copy.totalRefills = this.totalRefills
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RateLimiter)) return false
    return (
      this.maxTokens === other.maxTokens &&
      this.refillRate === other.refillRate &&
      this.refillIntervalMs === other.refillIntervalMs
    )
  }
}
