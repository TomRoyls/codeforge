export interface TokenBucketOptions {
  capacity?: number
  fillRate?: number
  maxTokens?: number
  refillRate?: number
  refillInterval?: number
}

export class TokenBucket {
  private tokens: number
  private lastRefill: number
  private readonly _capacity: number
  private readonly _fillRate: number
  private readonly _refillInterval: number
  private totalGranted: number = 0

  constructor(options: TokenBucketOptions) {
    const capacity = options.capacity ?? options.maxTokens
    const fillRate = options.fillRate ?? options.refillRate
    const refillInterval = options.refillInterval ?? 1000

    if (capacity === undefined || capacity < 1) {
      throw new RangeError(`capacity must be >= 1, got ${capacity}`)
    }
    if (fillRate === undefined || fillRate < 1) {
      throw new RangeError(`fillRate must be >= 1, got ${fillRate}`)
    }
    if (refillInterval < 1) {
      throw new RangeError(`refillInterval must be >= 1, got ${refillInterval}`)
    }
    this._capacity = capacity
    this._fillRate = fillRate
    this._refillInterval = refillInterval
    this.tokens = capacity
    this.lastRefill = Date.now()
  }

  consume(count: number = 1): boolean {
    if (count < 1) {
      throw new RangeError(`count must be >= 1, got ${count}`)
    }
    this.refill()
    if (this.tokens >= count) {
      this.tokens -= count
      this.totalGranted += count
      return true
    }
    return false
  }

  tryConsume(count: number = 1): boolean {
    if (count < 0) return false
    this.refill()
    if (this.tokens >= count) {
      this.tokens -= count
      this.totalGranted += count
      return true
    }
    return false
  }

  getAvailableTokens(): number {
    this.refill()
    return this.tokens
  }

  wait(count: number = 1): number {
    this.refill()
    if (this.tokens >= count) return 0
    const needed = count - this.tokens
    return Math.ceil((needed / this._fillRate) * this._refillInterval)
  }

  get available(): number {
    this.refill()
    return this.tokens
  }

  get capacity(): number {
    return this._capacity
  }

  get fillRate(): number {
    return this._fillRate
  }

  getCapacity(): number {
    return this._capacity
  }

  getRefillRate(): number {
    return this._fillRate
  }

  async waitForToken(count: number = 1): Promise<void> {
    this.refill()
    if (this.tokens >= count) {
      this.tokens -= count
      this.totalGranted += count
      return
    }
    const waitMs = this.wait(count)
    await new Promise((resolve) => setTimeout(resolve, waitMs))
    this.refill()
    this.tokens -= count
    this.totalGranted += count
  }

  getStats(): { capacity: number; fillRate: number; totalGranted: number } {
    return {
      capacity: this._capacity,
      fillRate: this._fillRate,
      totalGranted: this.totalGranted,
    }
  }

  reset(): void {
    this.tokens = this._capacity
    this.lastRefill = Date.now()
    this.totalGranted = 0
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    const intervals = elapsed / this._refillInterval
    const tokensToAdd = intervals * this._fillRate
    if (tokensToAdd < 1) return
    this.tokens = Math.min(this._capacity, this.tokens + Math.floor(tokensToAdd))
    this.lastRefill = now
  }
}
