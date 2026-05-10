export interface TokenBucketOptions {
  capacity: number
  refillRate: number
  refillInterval?: number
}

export interface TokenBucketStatistics {
  totalConsumed: number
  totalRejected: number
  totalRefilled: number
  totalWaitTime: number
}

export type TimeProvider = () => number
