export class RateLimiter {
  readonly maxRequests: number
  readonly windowMs: number

  private readonly counters = new Map<string, Map<number, number>>()

  constructor(options: { maxRequests: number; windowMs: number }) {
    this.maxRequests = options.maxRequests
    this.windowMs = options.windowMs
  }

  tryAcquire(key: string = 'default'): { allowed: boolean; remaining: number; retryAfterMs: number } {
    if (this.maxRequests === 0) {
      return { allowed: false, remaining: 0, retryAfterMs: this.windowMs }
    }

    const now = Date.now()
    const currentWindowStart = Math.floor(now / this.windowMs) * this.windowMs
    const previousWindowStart = currentWindowStart - this.windowMs

    const keyCounters = this.counters.get(key)
    if (!keyCounters) {
      this.counters.set(key, new Map([[currentWindowStart, 1]]))
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        retryAfterMs: 0,
      }
    }

    const currentCount = keyCounters.get(currentWindowStart) ?? 0
    const previousCount = keyCounters.get(previousWindowStart) ?? 0

    const timeIntoCurrentWindow = now - currentWindowStart
    const previousWindowWeight = 1 - timeIntoCurrentWindow / this.windowMs
    const weightedPreviousCount = previousCount * previousWindowWeight

    const totalUsage = currentCount + weightedPreviousCount

    if (totalUsage < this.maxRequests) {
      keyCounters.set(currentWindowStart, currentCount + 1)
      this.cleanupOldWindows(keyCounters, currentWindowStart)
      const remaining = Math.max(0, Math.floor(this.maxRequests - (totalUsage + 1)))
      return {
        allowed: true,
        remaining,
        retryAfterMs: 0,
      }
    }

    this.cleanupOldWindows(keyCounters, currentWindowStart)
    const retryAfterMs = Math.ceil(currentWindowStart + this.windowMs - now)
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
    }
  }

  acquire(key: string = 'default'): boolean {
    return this.tryAcquire(key).allowed
  }

  reset(key: string = 'default'): void {
    this.counters.delete(key)
  }

  resetAll(): void {
    this.counters.clear()
  }

  getStatus(key: string = 'default'): { remaining: number; limit: number; retryAfterMs: number } {
    const now = Date.now()
    const currentWindowStart = Math.floor(now / this.windowMs) * this.windowMs
    const previousWindowStart = currentWindowStart - this.windowMs

    const keyCounters = this.counters.get(key)
    if (!keyCounters) {
      return {
        remaining: this.maxRequests,
        limit: this.maxRequests,
        retryAfterMs: 0,
      }
    }

    const currentCount = keyCounters.get(currentWindowStart) ?? 0
    const previousCount = keyCounters.get(previousWindowStart) ?? 0

    const timeIntoCurrentWindow = now - currentWindowStart
    const previousWindowWeight = 1 - timeIntoCurrentWindow / this.windowMs
    const weightedPreviousCount = previousCount * previousWindowWeight

    const totalUsage = currentCount + weightedPreviousCount
    const remaining = Math.max(0, Math.floor(this.maxRequests - totalUsage))

    let retryAfterMs = 0
    if (remaining === 0) {
      retryAfterMs = Math.ceil(currentWindowStart + this.windowMs - now)
    }

    this.cleanupOldWindows(keyCounters, currentWindowStart)

    return {
      remaining,
      limit: this.maxRequests,
      retryAfterMs,
    }
  }

  private cleanupOldWindows(keyCounters: Map<number, number>, currentWindowStart: number): void {
    const keepWindow = currentWindowStart - this.windowMs
    for (const [windowStart] of keyCounters) {
      if (windowStart < keepWindow) {
        keyCounters.delete(windowStart)
      }
    }
  }
}
