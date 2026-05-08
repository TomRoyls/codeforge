import type { RateLimiterConfig, RateLimitResult, LimiterStats } from './types.js'
import { DEFAULT_RATE_LIMITER_CONFIG } from './types.js'
import { TokenBucket } from './token-bucket.js'
import { SlidingWindow } from './sliding-window.js'

type LimiterInstance = TokenBucket | SlidingWindow

export class RateLimiter {
  private config: RateLimiterConfig
  private limiters: Map<string, LimiterInstance> = new Map()
  private rejectedCallbacks: Array<(key: string) => void> = []

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...DEFAULT_RATE_LIMITER_CONFIG, ...config }
  }

  private getKey(key?: string): string {
    if (key) {
      return this.config.keyGenerator ? this.config.keyGenerator(key) : key
    }
    return '__default__'
  }

  private getOrCreateLimiter(key: string): LimiterInstance {
    const existing = this.limiters.get(key)
    if (existing) return existing

    const limiter = this.createLimiter()
    this.limiters.set(key, limiter)
    return limiter
  }

  private createLimiter(): LimiterInstance {
    switch (this.config.algorithm) {
      case 'token-bucket': {
        const burstSize = this.config.burstSize ?? this.config.maxRequests
        const refillRate = this.config.refillRate ?? 1
        return new TokenBucket(burstSize, refillRate)
      }
      case 'sliding-window':
        return new SlidingWindow(this.config.maxRequests, this.config.windowMs)
      case 'fixed-window':
        return new SlidingWindow(this.config.maxRequests, this.config.windowMs)
    }
  }

  tryAcquire(key?: string): RateLimitResult {
    const resolvedKey = this.getKey(key)
    const limiter = this.getOrCreateLimiter(resolvedKey)
    const result = limiter.tryConsume(1)
    if (!result.allowed) {
      for (const cb of this.rejectedCallbacks) {
        cb(resolvedKey)
      }
    }
    return result
  }

  tryAcquireN(key: string, count: number): RateLimitResult {
    const resolvedKey = this.getKey(key)
    const limiter = this.getOrCreateLimiter(resolvedKey)

    if (limiter instanceof TokenBucket) {
      const result = limiter.tryConsume(count)
      if (!result.allowed) {
        for (const cb of this.rejectedCallbacks) {
          cb(resolvedKey)
        }
      }
      return result
    }

    const results: RateLimitResult[] = []
    let lastResult: RateLimitResult | undefined
    for (let i = 0; i < count; i++) {
      lastResult = limiter.tryConsume(1)
      results.push(lastResult!)
      if (!lastResult!.allowed) {
        break
      }
    }

    if (lastResult && !lastResult.allowed) {
      for (const cb of this.rejectedCallbacks) {
        cb(resolvedKey)
      }
    }

    const consumed = results.filter((r) => r.allowed).length
    return {
      allowed: consumed === count,
      remaining: lastResult?.remaining ?? 0,
      limit: this.config.maxRequests,
      resetAt: lastResult?.resetAt ?? Date.now(),
      retryAfter: lastResult?.retryAfter ?? 0,
      consumed,
    }
  }

  getStatus(key?: string): RateLimitResult {
    const resolvedKey = this.getKey(key)
    const limiter = this.limiters.get(resolvedKey)
    if (!limiter) {
      return {
        allowed: true,
        remaining: this.config.algorithm === 'token-bucket'
          ? this.config.burstSize ?? this.config.maxRequests
          : this.config.maxRequests,
        limit: this.config.maxRequests,
        resetAt: Date.now(),
        retryAfter: 0,
        consumed: 0,
      }
    }

    if (limiter instanceof TokenBucket) {
      return {
        allowed: limiter.getAvailableTokens() > 0,
        remaining: Math.floor(limiter.getAvailableTokens()),
        limit: this.config.burstSize ?? this.config.maxRequests,
        resetAt: Date.now(),
        retryAfter: 0,
        consumed: 0,
      }
    }

    return {
      allowed: limiter.getCurrentCount() < this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - limiter.getCurrentCount()),
      limit: this.config.maxRequests,
      resetAt: limiter.getWindowStart() + this.config.windowMs,
      retryAfter: 0,
      consumed: 0,
    }
  }

  reset(key?: string): void {
    if (key) {
      const resolvedKey = this.getKey(key)
      const limiter = this.limiters.get(resolvedKey)
      if (limiter) limiter.reset()
    } else {
      const defaultLimiter = this.limiters.get('__default__')
      if (defaultLimiter) defaultLimiter.reset()
    }
  }

  resetAll(): void {
    for (const limiter of this.limiters.values()) {
      limiter.reset()
    }
    this.limiters.clear()
  }

  getStats(key?: string): LimiterStats {
    const resolvedKey = this.getKey(key)
    const limiter = this.limiters.get(resolvedKey)
    if (!limiter) {
      return {
        totalRequests: 0,
        allowedRequests: 0,
        rejectedRequests: 0,
        currentUsage: 0,
        maxUsage: 0,
        avgResponseTime: 0,
      }
    }
    return limiter.getStats()
  }

  getConfig(): RateLimiterConfig {
    return { ...this.config }
  }

  setConfig(config: Partial<RateLimiterConfig>): void {
    this.config = { ...this.config, ...config }
    this.limiters.clear()
  }

  onRejected(callback: (key: string) => void): void {
    this.rejectedCallbacks.push(callback)
  }
}
