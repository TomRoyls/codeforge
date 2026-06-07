export interface RateLimiterOptions {
  maxRequests?: number
  windowMs?: number
  tokensPerSecond?: number
  maxTokens?: number
  limit?: number
  interval?: number
}

interface WindowState {
  count: number
  windowStart: number
}

/**
 * Fixed-window rate limiter supporting per-key tracking.
 *
 * Accepted constructor forms:
 *   new RateLimiter({ maxRequests, windowMs })
 *   new RateLimiter(maxRequests, windowMs)
 *   new RateLimiter({ tokensPerSecond, maxTokens })  // token-bucket alias
 *   new RateLimiter({ limit, interval })              // alias
 */
export class RateLimiter {
  readonly maxRequests: number
  readonly windowMs: number
  private buckets: Map<string, WindowState> = new Map()
  private readonly defaultKey = '__default__'

  constructor(maxRequests: number, windowMs: number)
  constructor(options: RateLimiterOptions)
  constructor(optionsOrMax: RateLimiterOptions | number, windowMsArg?: number) {
    let maxR: number
    let window: number

    if (typeof optionsOrMax === 'number') {
      maxR = optionsOrMax
      window = windowMsArg ?? 1000
    } else {
      const opts = optionsOrMax ?? {}
      if (opts.maxRequests !== undefined) {
        maxR = opts.maxRequests
      } else if (opts.limit !== undefined) {
        maxR = opts.limit
      } else if (opts.maxTokens !== undefined) {
        maxR = opts.maxTokens
      } else {
        maxR = 0
      }

      if (opts.windowMs !== undefined) {
        window = opts.windowMs
      } else if (opts.interval !== undefined) {
        window = opts.interval
      } else {
        window = 1000
      }
    }

    this.maxRequests = maxR
    this.windowMs = window
  }

  private getBucket(key: string | undefined): WindowState {
    const k = key ?? this.defaultKey
    let bucket = this.buckets.get(k)
    if (!bucket) {
      bucket = { count: 0, windowStart: Date.now() }
      this.buckets.set(k, bucket)
    }
    return bucket
  }

  private rollover(bucket: WindowState): void {
    const now = Date.now()
    if (now - bucket.windowStart >= this.windowMs) {
      bucket.count = 0
      bucket.windowStart = now
    }
  }

  tryAcquire(key?: string): { allowed: boolean; remaining: number; retryAfterMs?: number } {
    const bucket = this.getBucket(key)
    this.rollover(bucket)

    if (this.maxRequests <= 0) {
      const elapsed = Date.now() - bucket.windowStart
      const retryAfterMs = Math.max(1, this.windowMs - elapsed)
      return { allowed: false, remaining: 0, retryAfterMs }
    }

    if (bucket.count >= this.maxRequests) {
      const elapsed = Date.now() - bucket.windowStart
      const retryAfterMs = Math.max(1, this.windowMs - elapsed)
      return { allowed: false, remaining: 0, retryAfterMs }
    }

    bucket.count++
    const remaining = this.maxRequests - bucket.count
    return { allowed: true, remaining }
  }

  acquire(key?: string): boolean {
    return this.tryAcquire(key).allowed
  }

  reset(key?: string): void {
    if (key === undefined) {
      this.buckets.delete(this.defaultKey)
    } else {
      this.buckets.delete(key)
    }
  }

  resetAll(): void {
    this.buckets.clear()
  }

  getStatus(key?: string): { remaining: number; limit: number } {
    const bucket = this.getBucket(key)
    this.rollover(bucket)
    const remaining = Math.max(0, this.maxRequests - bucket.count)
    return { remaining, limit: this.maxRequests }
  }
}
