export interface RateLimiterOptions {
  maxTokens: number
  refillRate: number
  refillIntervalMs: number
}

export class RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly _maxTokens: number
  private readonly _refillRate: number
  private readonly _refillIntervalMs: number
  private _totalAcquired: number = 0
  private _totalRejected: number = 0
  private _totalRefills: number = 0

  constructor(options: RateLimiterOptions) {
    if (options.maxTokens < 1) {
      throw new RangeError(`maxTokens must be >= 1, got ${options.maxTokens}`)
    }
    if (options.refillRate < 1) {
      throw new RangeError(`refillRate must be >= 1, got ${options.refillRate}`)
    }
    if (options.refillIntervalMs < 1) {
      throw new RangeError(`refillIntervalMs must be >= 1, got ${options.refillIntervalMs}`)
    }
    this._maxTokens = options.maxTokens
    this._refillRate = options.refillRate
    this._refillIntervalMs = options.refillIntervalMs
    this.tokens = options.maxTokens
    this.lastRefill = Date.now()
  }

  tryAcquire(count: number = 1): boolean {
    if (count < 1) {
      throw new RangeError(`count must be >= 1, got ${count}`)
    }
    this.refill()
    if (this.tokens >= count) {
      this.tokens -= count
      this._totalAcquired += count
      return true
    }
    this._totalRejected++
    return false
  }

  async acquire(count: number = 1): Promise<void> {
    this.refill()
    if (this.tokens >= count) {
      this.tokens -= count
      this._totalAcquired += count
      return
    }
    const needed = count - this.tokens
    const intervals = Math.ceil(needed / this._refillRate)
    const waitMs = intervals * this._refillIntervalMs
    await new Promise((resolve) => setTimeout(resolve, waitMs))
    this.refill()
    this.tokens -= count
    this._totalAcquired += count
  }

  getAvailableTokens(): number {
    this.refill()
    return this.tokens
  }

  getStats(): {
    totalAcquired: number
    totalRejected: number
    availableTokens: number
    maxTokens: number
    totalRefills: number
  } {
    return {
      totalAcquired: this._totalAcquired,
      totalRejected: this._totalRejected,
      availableTokens: this.tokens,
      maxTokens: this._maxTokens,
      totalRefills: this._totalRefills,
    }
  }

  reset(): void {
    this.tokens = this._maxTokens
    this.lastRefill = Date.now()
    this._totalAcquired = 0
    this._totalRejected = 0
    this._totalRefills = 0
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    if (elapsed < this._refillIntervalMs) return
    const intervals = Math.floor(elapsed / this._refillIntervalMs)
    const tokensToAdd = intervals * this._refillRate
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this._maxTokens, this.tokens + tokensToAdd)
      this._totalRefills += intervals
    }
    this.lastRefill += intervals * this._refillIntervalMs
  }
}
