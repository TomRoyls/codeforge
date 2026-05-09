export interface CountingBloomFilterOptions {
  expectedItems: number
  falsePositiveRate: number
}

export const DEFAULT_COUNTING_BLOOM_OPTIONS: CountingBloomFilterOptions = {
  expectedItems: 1000,
  falsePositiveRate: 0.01,
}
