export interface RateLimitTokenBucketOptions {
  capacity: number
  refillRate: number
  refillInterval: number
}

export interface RateLimitTokenBucketStats {
  availableTokens: number
  capacity: number
  refillRate: number
  lastRefillTime: number
}

export interface TryAcquireResult {
  allowed: boolean
  remainingTokens: number
  waitTimeMs: number
}

export const DEFAULT_RATELIMIT_TOKEN_BUCKET_OPTIONS: RateLimitTokenBucketOptions = {
  capacity: 10,
  refillRate: 1,
  refillInterval: 1000,
}
