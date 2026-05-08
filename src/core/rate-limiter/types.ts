export type LimiterAlgorithm = 'token-bucket' | 'sliding-window' | 'fixed-window'

export interface RateLimiterConfig {
  algorithm: LimiterAlgorithm
  maxRequests: number
  windowMs: number
  burstSize?: number
  refillRate?: number
  keyGenerator?: (id: string) => string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  resetAt: number
  retryAfter: number
  consumed: number
}

export interface LimiterStats {
  totalRequests: number
  allowedRequests: number
  rejectedRequests: number
  currentUsage: number
  maxUsage: number
  avgResponseTime: number
}

export const DEFAULT_RATE_LIMITER_CONFIG: RateLimiterConfig = {
  algorithm: 'token-bucket',
  maxRequests: 100,
  windowMs: 60000,
  burstSize: 10,
  refillRate: 1,
}
