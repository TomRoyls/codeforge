export interface BloomFilterOptions {
  expectedItems: number
  falsePositiveRate: number
}

export interface BloomFilterJSON {
  bitArray: number[]
  bitCount: number
  hashCount: number
  expectedItems: number
  targetFalsePositiveRate: number
  itemCount: number
}

export const DEFAULT_BLOOM_FILTER_OPTIONS: BloomFilterOptions = {
  expectedItems: 1000,
  falsePositiveRate: 0.01,
}
