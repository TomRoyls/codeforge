export interface CountingBloomFilterOptions {
  capacity: number
  errorRate: number
}

export const DEFAULT_COUNTING_BLOOM_FILTER_OPTIONS: CountingBloomFilterOptions = {
  capacity: 1000,
  errorRate: 0.01,
}
