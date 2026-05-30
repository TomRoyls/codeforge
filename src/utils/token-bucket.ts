export interface TokenBucketOptions {
  capacity: number
  fillRate: number
}

export class TokenBucket {
  private tokens: number
  private lastRefill: number
  private readonly _capacity: number
  private readonly _fillRate: number
  private totalGranted: number = 0

  constructor(options: TokenBucketOptions) {
    if (options.capacity < 1) {
      throw new RangeError(`capacity must be >= 1, got ${options.capacity}`)
    }
    if (options.fillRate < 1) {
      throw new RangeError(`fillRate must be >= 1, got ${options.fillRate}`)
    }
    this._capacity = options.capacity
    this._fillRate = options.fillRate
    this.tokens = options.capacity
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

  wait(count: number = 1): number {
    this.refill()
    if (this.tokens >= count) return 0
    const needed = count - this.tokens
    return Math.ceil(needed / this._fillRate) * 1000
  }

  get available(): number {
    this.refill()
    return this.tokens
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
    const tokensToAdd = (elapsed / 1000) * this._fillRate
    if (tokensToAdd < 1) return
    this.tokens = Math.min(this._capacity, this.tokens + Math.floor(tokensToAdd))
    this.lastRefill = now
  }
}
