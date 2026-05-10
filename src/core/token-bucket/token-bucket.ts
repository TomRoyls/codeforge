import type { TokenBucketOptions, TokenBucketStatistics, TimeProvider } from './types.js'

export class TokenBucket {
  private _capacity: number
  private _refillRate: number
  private _refillInterval: number
  private _tokens: number
  private _lastRefillTime: number
  private _totalConsumed = 0
  private _totalRejected = 0
  private _totalRefilled = 0
  private _totalWaitTime = 0
  private readonly _now: TimeProvider

  constructor(
    capacity: number = 10,
    refillRate: number = 1,
    refillInterval: number = 1000,
    now?: TimeProvider,
  ) {
    if (capacity <= 0) throw new RangeError('capacity must be > 0')
    if (refillRate <= 0) throw new RangeError('refillRate must be > 0')
    if (refillInterval <= 0) throw new RangeError('refillInterval must be > 0')

    this._capacity = capacity
    this._refillRate = refillRate
    this._refillInterval = refillInterval
    this._tokens = capacity
    this._now = now ?? (() => Date.now())
    this._lastRefillTime = this._now()
  }

  static fromOptions(options: TokenBucketOptions, now?: TimeProvider): TokenBucket {
    return new TokenBucket(options.capacity, options.refillRate, options.refillInterval, now)
  }

  private refill(): void {
    const now = this._now()
    const elapsed = now - this._lastRefillTime
    if (elapsed < this._refillInterval) return

    const intervals = Math.floor(elapsed / this._refillInterval)
    const tokensToAdd = intervals * this._refillRate
    const capped = Math.min(this._capacity, this._tokens + tokensToAdd)
    const actuallyAdded = capped - this._tokens
    if (actuallyAdded > 0) {
      this._totalRefilled += actuallyAdded
    }
    this._tokens = capped
    this._lastRefillTime = now - (elapsed % this._refillInterval)
  }

  consume(tokens: number = 1): boolean {
    if (tokens <= 0) throw new RangeError('tokens must be > 0')
    this.refill()
    if (this._tokens >= tokens) {
      this._tokens -= tokens
      this._totalConsumed += tokens
      return true
    }
    this._totalRejected += tokens
    return false
  }

  tryConsume(tokens: number = 1): boolean {
    if (tokens <= 0) throw new RangeError('tokens must be > 0')
    this.refill()
    if (this._tokens >= tokens) {
      this._tokens -= tokens
      this._totalConsumed += tokens
      return true
    }
    this._totalRejected += tokens
    return false
  }

  waitUntilAvailable(tokens: number = 1): number {
    if (tokens <= 0) throw new RangeError('tokens must be > 0')
    this.refill()
    if (this._tokens >= tokens) return 0

    const deficit = tokens - this._tokens
    const intervalsNeeded = Math.ceil(deficit / this._refillRate)
    const waitMs = intervalsNeeded * this._refillInterval
    const elapsed = this._now() - this._lastRefillTime
    const remaining = this._refillInterval - (elapsed % this._refillInterval)
    const totalWait = remaining + (intervalsNeeded - 1) * this._refillInterval
    this._totalWaitTime += totalWait
    return totalWait
  }

  get tokens(): number {
    this.refill()
    return this._tokens
  }

  get capacity(): number {
    return this._capacity
  }

  get refillRate(): number {
    return this._refillRate
  }

  get refillInterval(): number {
    return this._refillInterval
  }

  get lastRefill(): number {
    return this._lastRefillTime
  }

  get availableTokens(): number {
    return this.tokens
  }

  reset(): void {
    this._tokens = this._capacity
    this._lastRefillTime = this._now()
    this._totalConsumed = 0
    this._totalRejected = 0
    this._totalRefilled = 0
    this._totalWaitTime = 0
  }

  fill(): void {
    const added = this._capacity - this._tokens
    if (added > 0) {
      this._totalRefilled += added
    }
    this._tokens = this._capacity
  }

  drain(): void {
    this._tokens = 0
  }

  setCapacity(n: number): void {
    if (n <= 0) throw new RangeError('capacity must be > 0')
    this._capacity = n
    if (this._tokens > n) {
      this._tokens = n
    }
  }

  setRefillRate(n: number): void {
    if (n <= 0) throw new RangeError('refillRate must be > 0')
    this._refillRate = n
  }

  get statistics(): TokenBucketStatistics {
    return {
      totalConsumed: this._totalConsumed,
      totalRejected: this._totalRejected,
      totalRefilled: this._totalRefilled,
      totalWaitTime: this._totalWaitTime,
    }
  }
}
