export class TokenBucket2 {
  private _availableTokens: number
  private _lastRefillTime: number

  constructor(
    private readonly _capacity: number,
    private readonly _refillRate: number,
    initialTokens?: number,
  ) {
    if (this._capacity < 1) {
      throw new Error('capacity must be at least 1')
    }
    if (this._refillRate < 0) {
      throw new Error('refillRate must be non-negative')
    }

    this._lastRefillTime = Date.now()
    this._availableTokens = initialTokens ?? this._capacity

    if (this._availableTokens < 0 || this._availableTokens > this._capacity) {
      throw new Error('initialTokens must be between 0 and capacity')
    }
  }

  tryConsume(tokens: number = 1): boolean {
    this.refill()
    if (this._availableTokens >= tokens) {
      this._availableTokens -= tokens
      return true
    }
    return false
  }

  consume(tokens: number = 1): void {
    if (!this.tryConsume(tokens)) {
      throw new Error(`Insufficient tokens: need ${tokens}, available ${this._availableTokens}`)
    }
  }

  waitTime(tokens: number): number {
    this.refill()
    if (this._availableTokens >= tokens) {
      return 0
    }

    const tokensNeeded = tokens - this._availableTokens
    const tokensPerMs = this._refillRate / 1000

    if (tokensPerMs === 0) {
      return Infinity
    }

    return Math.ceil(tokensNeeded / tokensPerMs)
  }

  reserve(tokens: number): number {
    this.refill()
    const waitMs = this.waitTime(tokens)

    this._availableTokens -= tokens

    return waitMs
  }

  refill(): void {
    const now = Date.now()
    const elapsedMs = now - this._lastRefillTime

    if (elapsedMs <= 0) {
      return
    }

    const tokensToAdd = elapsedMs * this._refillRate / 1000
    this._availableTokens = Math.min(this._capacity, this._availableTokens + tokensToAdd)
    this._lastRefillTime = now
  }

  get availableTokens(): number {
    this.refill()
    return this._availableTokens
  }

  get capacity(): number {
    return this._capacity
  }

  get refillRate(): number {
    return this._refillRate
  }

  get lastRefillTime(): number {
    this.refill()
    return this._lastRefillTime
  }
}