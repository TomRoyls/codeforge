import type {
  RateLimitTokenBucketOptions,
  RateLimitTokenBucketStats,
  TryAcquireResult,
} from './types.js'
import { DEFAULT_RATELIMIT_TOKEN_BUCKET_OPTIONS } from './types.js'

export class RateLimitTokenBucket {
  private tokens: number
  private capacity: number
  private refillRate: number
  private refillInterval: number
  private lastRefillTime: number

  constructor(options: Partial<RateLimitTokenBucketOptions> & { capacity: number; refillRate: number }) {
    const merged: RateLimitTokenBucketOptions = {
      ...DEFAULT_RATELIMIT_TOKEN_BUCKET_OPTIONS,
      ...options,
    }
    if (merged.capacity <= 0) {
      throw new RangeError('capacity must be greater than 0')
    }
    if (merged.refillRate <= 0) {
      throw new RangeError('refillRate must be greater than 0')
    }
    if (merged.refillInterval <= 0) {
      throw new RangeError('refillInterval must be greater than 0')
    }
    this.capacity = merged.capacity
    this.refillRate = merged.refillRate
    this.refillInterval = merged.refillInterval
    this.tokens = merged.capacity
    this.lastRefillTime = Date.now()
  }

  private refillTokens(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefillTime
    if (elapsed < this.refillInterval) {
      return
    }
    const intervals = Math.floor(elapsed / this.refillInterval)
    const tokensToAdd = intervals * this.refillRate
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
    this.lastRefillTime += intervals * this.refillInterval
  }

  acquire(cost: number = 1): boolean {
    this.refillTokens()
    if (cost > this.tokens) {
      return false
    }
    this.tokens -= cost
    return true
  }

  wait(cost: number = 1): number {
    this.refillTokens()
    if (cost <= this.tokens) {
      return 0
    }
    const deficit = cost - this.tokens
    const intervalsNeeded = Math.ceil(deficit / this.refillRate)
    const msToWait = intervalsNeeded * this.refillInterval
    const elapsed = Date.now() - this.lastRefillTime
    const remainingInInterval = this.refillInterval - (elapsed % this.refillInterval)
    return msToWait - this.refillInterval + remainingInInterval
  }

  tryAcquire(cost: number = 1): TryAcquireResult {
    this.refillTokens()
    const allowed = cost <= this.tokens
    const waitTimeMs = allowed ? 0 : this.wait(cost)
    const remainingTokens = allowed ? this.tokens - cost : this.tokens
    if (allowed) {
      this.tokens -= cost
    }
    return { allowed, remainingTokens, waitTimeMs }
  }

  getAvailableTokens(): number {
    this.refillTokens()
    return this.tokens
  }

  getCapacity(): number {
    return this.capacity
  }

  getRefillRate(): number {
    return this.refillRate
  }

  getRefillInterval(): number {
    return this.refillInterval
  }

  refill(): void {
    this.refillTokens()
  }

  consume(cost: number): boolean {
    return this.acquire(cost)
  }

  reset(): void {
    this.tokens = this.capacity
    this.lastRefillTime = Date.now()
  }

  setCapacity(capacity: number): void {
    if (capacity <= 0) {
      throw new RangeError('capacity must be greater than 0')
    }
    const wasFull = this.tokens >= this.capacity
    this.capacity = capacity
    if (wasFull || this.tokens > this.capacity) {
      this.tokens = this.capacity
    }
  }

  setRefillRate(rate: number): void {
    if (rate <= 0) {
      throw new RangeError('refillRate must be greater than 0')
    }
    this.refillRate = rate
  }

  clone(): RateLimitTokenBucket {
    const cloned = new RateLimitTokenBucket({
      capacity: this.capacity,
      refillRate: this.refillRate,
      refillInterval: this.refillInterval,
    })
    cloned.tokens = this.tokens
    cloned.lastRefillTime = this.lastRefillTime
    return cloned
  }

  getStats(): RateLimitTokenBucketStats {
    this.refillTokens()
    return {
      availableTokens: this.tokens,
      capacity: this.capacity,
      refillRate: this.refillRate,
      lastRefillTime: this.lastRefillTime,
    }
  }
}

export { DEFAULT_RATELIMIT_TOKEN_BUCKET_OPTIONS } from './types.js'
export type {
  RateLimitTokenBucketOptions,
  RateLimitTokenBucketStats,
  TryAcquireResult,
} from './types.js'
