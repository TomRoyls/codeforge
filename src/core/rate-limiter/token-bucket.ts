import type { RateLimitResult, LimiterStats } from './types.js'

export class TokenBucket {
  private tokens: number
  private readonly maxTokens: number
  private readonly refillRate: number
  private lastRefillTime: number
  private totalRequests = 0
  private allowedRequests = 0
  private rejectedRequests = 0
  private maxUsage = 0
  private totalResponseTime = 0

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens
    this.refillRate = refillRate
    this.tokens = maxTokens
    this.lastRefillTime = Date.now()
  }

  tryConsume(tokens: number = 1): RateLimitResult {
    const startTime = Date.now()
    this.refill()
    this.totalRequests++

    const available = this.getAvailableTokens()
    const allowed = available >= tokens

    if (allowed) {
      this.tokens -= tokens
      this.allowedRequests++
    } else {
      this.rejectedRequests++
    }

    const currentUsage = this.maxTokens - this.getAvailableTokens()
    if (currentUsage > this.maxUsage) {
      this.maxUsage = currentUsage
    }

    const elapsed = Date.now() - startTime
    this.totalResponseTime += elapsed

    const tokensNeeded = tokens - available
    const retryAfter = tokensNeeded > 0 ? Math.ceil(tokensNeeded / this.refillRate) * 1000 : 0
    const resetAt = this.tokens < this.maxTokens
      ? this.lastRefillTime + Math.ceil((this.maxTokens - this.tokens) / this.refillRate) * 1000
      : Date.now()

    return {
      allowed,
      remaining: Math.max(0, Math.floor(this.getAvailableTokens())),
      limit: this.maxTokens,
      resetAt,
      retryAfter: allowed ? 0 : retryAfter,
      consumed: allowed ? tokens : 0,
    }
  }

  tryConsumeWithTimeout(tokens: number, timeoutMs: number): boolean {
    const startTime = Date.now()
    const deadline = startTime + timeoutMs

    while (Date.now() < deadline) {
      this.refill()
      if (this.getAvailableTokens() >= tokens) {
        this.tokens -= tokens
        this.totalRequests++
        this.allowedRequests++
        const currentUsage = this.maxTokens - this.getAvailableTokens()
        if (currentUsage > this.maxUsage) {
          this.maxUsage = currentUsage
        }
        return true
      }

      const tokensNeeded = tokens - this.getAvailableTokens()
      const waitMs = Math.min(
        Math.ceil(tokensNeeded / this.refillRate) * 1000,
        deadline - Date.now(),
      )
      if (waitMs <= 0) break

      const target = Date.now() + waitMs
      while (Date.now() < target) {
        void 0
      }
    }

    this.totalRequests++
    this.rejectedRequests++
    return false
  }

  getAvailableTokens(): number {
    return this.tokens
  }

  refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefillTime
    const tokensToAdd = Math.floor(elapsed / 1000) * this.refillRate
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
      this.lastRefillTime = now - (elapsed % 1000)
    }
  }

  reset(): void {
    this.tokens = this.maxTokens
    this.lastRefillTime = Date.now()
    this.totalRequests = 0
    this.allowedRequests = 0
    this.rejectedRequests = 0
    this.maxUsage = 0
    this.totalResponseTime = 0
  }

  getStats(): LimiterStats {
    return {
      totalRequests: this.totalRequests,
      allowedRequests: this.allowedRequests,
      rejectedRequests: this.rejectedRequests,
      currentUsage: this.maxTokens - this.getAvailableTokens(),
      maxUsage: this.maxUsage,
      avgResponseTime: this.totalRequests > 0 ? this.totalResponseTime / this.totalRequests : 0,
    }
  }
}
