export interface TokenBucketOptions {
  capacity: number
  fillRate: number
}

export class TokenBucket {
  private tokens: number
  private readonly capacity: number
  private readonly fillRate: number
  private lastRefill: number
  private _totalGranted: number = 0
  private _totalRejected: number = 0

  constructor(options: TokenBucketOptions) {
    if (options.capacity < 1) throw new RangeError(`capacity must be >= 1, got ${options.capacity}`)
    if (options.fillRate <= 0) throw new RangeError(`fillRate must be > 0, got ${options.fillRate}`)
    this.capacity = options.capacity
    this.fillRate = options.fillRate
    this.tokens = options.capacity
    this.lastRefill = Date.now()
  }

  public consume(count: number = 1): boolean {
    if (count < 1) throw new RangeError(`count must be >= 1, got ${count}`)
    this.refill()
    if (this.tokens >= count) {
      this.tokens -= count
      this._totalGranted += count
      return true
    }
    this._totalRejected++
    return false
  }

  public wait(count: number = 1): number {
    if (count < 1) throw new RangeError(`count must be >= 1, got ${count}`)
    this.refill()
    if (this.tokens >= count) return 0
    const needed = count - this.tokens
    return Math.ceil((needed / this.fillRate) * 1000)
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    const added = elapsed * this.fillRate
    if (added > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + added)
      this.lastRefill = now
    }
  }

  public get available(): number {
    this.refill()
    return this.tokens
  }

  public getStats(): { available: number; capacity: number; fillRate: number; totalGranted: number; totalRejected: number } {
    return {
      available: this.tokens,
      capacity: this.capacity,
      fillRate: this.fillRate,
      totalGranted: this._totalGranted,
      totalRejected: this._totalRejected,
    }
  }

  public reset(): void {
    this.tokens = this.capacity
    this.lastRefill = Date.now()
    this._totalGranted = 0
    this._totalRejected = 0
  }
}
