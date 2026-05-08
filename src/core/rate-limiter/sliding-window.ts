import type { RateLimitResult, LimiterStats } from './types.js'

export class SlidingWindow {
  private readonly maxRequests: number
  private readonly windowMs: number
  private timestamps: number[] = []
  private totalRequests = 0
  private allowedRequests = 0
  private rejectedRequests = 0
  private maxUsage = 0
  private totalResponseTime = 0

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  tryRequest(): RateLimitResult {
    return this.tryRequestAt(Date.now())
  }

  tryConsume(_count: number = 1): RateLimitResult {
    return this.tryRequest()
  }

  tryRequestAt(timestamp: number): RateLimitResult {
    const startTime = Date.now()
    this.totalRequests++

    const windowStart = timestamp - this.windowMs
    this.timestamps = this.timestamps.filter((ts) => ts > windowStart)

    const currentCount = this.timestamps.length
    const allowed = currentCount < this.maxRequests

    if (allowed) {
      this.timestamps.push(timestamp)
      this.allowedRequests++
    } else {
      this.rejectedRequests++
    }

    const newCount = this.timestamps.length
    if (newCount > this.maxUsage) {
      this.maxUsage = newCount
    }

    const elapsed = Date.now() - startTime
    this.totalResponseTime += elapsed

    const oldestInWindow = this.timestamps.length > 0 ? this.timestamps[0]! : timestamp
    const resetAt = oldestInWindow + this.windowMs
    const retryAfter = this.timestamps.length > 0
      ? Math.max(0, this.timestamps[0]! + this.windowMs - timestamp)
      : 0

    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - newCount),
      limit: this.maxRequests,
      resetAt,
      retryAfter: allowed ? 0 : retryAfter,
      consumed: allowed ? 1 : 0,
    }
  }

  getCurrentCount(): number {
    const windowStart = Date.now() - this.windowMs
    this.timestamps = this.timestamps.filter((ts) => ts > windowStart)
    return this.timestamps.length
  }

  getWindowStart(): number {
    return Date.now() - this.windowMs
  }

  reset(): void {
    this.timestamps = []
    this.totalRequests = 0
    this.allowedRequests = 0
    this.rejectedRequests = 0
    this.maxUsage = 0
    this.totalResponseTime = 0
  }

  getStats(): LimiterStats {
    const windowStart = Date.now() - this.windowMs
    const currentTimestamps = this.timestamps.filter((ts) => ts > windowStart)
    return {
      totalRequests: this.totalRequests,
      allowedRequests: this.allowedRequests,
      rejectedRequests: this.rejectedRequests,
      currentUsage: currentTimestamps.length,
      maxUsage: this.maxUsage,
      avgResponseTime: this.totalRequests > 0 ? this.totalResponseTime / this.totalRequests : 0,
    }
  }
}
