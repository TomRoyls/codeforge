export interface BloomCountMapOptions {
  capacity?: number
  errorRate?: number
}

export const DEFAULT_BLOOM_COUNT_MAP_OPTIONS: Required<BloomCountMapOptions> = {
  capacity: 1000,
  errorRate: 0.01,
}
