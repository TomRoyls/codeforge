export class TokenBucketNew {
  private tokens: number
  private lastRefill: number
  private maxTokens: number
  private refillRateMs: number

  constructor(maxTokens = 10, refillRateMs = 1000) {
    this.maxTokens = maxTokens
    this.refillRateMs = refillRateMs
    this.tokens = maxTokens
    this.lastRefill = Date.now()
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    const tokensToAdd = Math.floor(elapsed / this.refillRateMs)
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
      this.lastRefill += tokensToAdd * this.refillRateMs
    }
  }

  consume(count = 1): boolean {
    this.refill()
    if (this.tokens >= count) {
      this.tokens -= count
      return true
    }
    return false
  }

  get available(): number {
    this.refill()
    return this.tokens
  }

  get isEmpty(): boolean {
    return this.available === 0
  }

  get capacity(): number {
    return this.maxTokens
  }

  clear(): void {
    this.tokens = this.maxTokens
    this.lastRefill = Date.now()
  }

  toString(): string {
    return JSON.stringify({ available: this.available, maxTokens: this.maxTokens })
  }

  toJSON(): Record<string, unknown> {
    return { available: this.available, maxTokens: this.maxTokens, refillRateMs: this.refillRateMs }
  }

  clone(): TokenBucketNew {
    const copy = new TokenBucketNew(this.maxTokens, this.refillRateMs)
    copy.tokens = this.tokens
    copy.lastRefill = this.lastRefill
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TokenBucketNew)) return false
    return this.maxTokens === other.maxTokens && this.refillRateMs === other.refillRateMs
  }
}
