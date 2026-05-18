export interface RateLimiterOptions {
  maxTokens: number
  refillRate: number
  refillIntervalMs: number
}

export interface RateLimiterStats {
  availableTokens: number
  maxTokens: number
  totalAcquired: number
  totalRejected: number
  totalRefills: number
}

export class RateLimiter {
  private tokens: number
  private readonly maxTokens: number
  private readonly refillRate: number
  private readonly refillIntervalMs: number
  private lastRefillTime: number
  private totalAcquired: number = 0
  private totalRejected: number = 0
  private totalRefills: number = 0

  constructor(options: RateLimiterOptions) {
    if (options.maxTokens < 1) throw new RangeError(`maxTokens must be >= 1, got ${options.maxTokens}`)
    if (options.refillRate < 1) throw new RangeError(`refillRate must be >= 1, got ${options.refillRate}`)
    if (options.refillIntervalMs < 1)
      throw new RangeError(`refillIntervalMs must be >= 1, got ${options.refillIntervalMs}`)

    this.maxTokens = options.maxTokens
    this.tokens = options.maxTokens
    this.refillRate = options.refillRate
    this.refillIntervalMs = options.refillIntervalMs
    this.lastRefillTime = Date.now()
  }

  public tryAcquire(count: number = 1): boolean {
    if (count < 1) throw new RangeError(`count must be >= 1, got ${count}`)
    this.refill()
    if (this.tokens >= count) {
      this.tokens -= count
      this.totalAcquired += count
      return true
    }
    this.totalRejected++
    return false
  }

  public async acquire(count: number = 1): Promise<void> {
    while (true) {
      if (this.tryAcquire(count)) return
      await new Promise((resolve) => setTimeout(resolve, this.refillIntervalMs))
    }
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefillTime
    const intervals = Math.floor(elapsed / this.refillIntervalMs)
    if (intervals <= 0) return

    const tokensToAdd = intervals * this.refillRate
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
    this.lastRefillTime += intervals * this.refillIntervalMs
    this.totalRefills += intervals
  }

  public getAvailableTokens(): number {
    this.refill()
    return this.tokens
  }

  public getStats(): RateLimiterStats {
    return {
      availableTokens: this.tokens,
      maxTokens: this.maxTokens,
      totalAcquired: this.totalAcquired,
      totalRejected: this.totalRejected,
      totalRefills: this.totalRefills,
    }
  }

  public reset(): void {
    this.tokens = this.maxTokens
    this.lastRefillTime = Date.now()
    this.totalAcquired = 0
    this.totalRejected = 0
    this.totalRefills = 0
  }
}
