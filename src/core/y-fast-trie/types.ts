export interface YFastTrieOptions {
  universeSize: number
}

export interface YFastTrieStats {
  size: number
  bucketCount: number
  minBucketSize: number
  maxBucketSize: number
}

export const DEFAULT_UNIVERSE_SIZE = 256
