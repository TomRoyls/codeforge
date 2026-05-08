export interface BloomFilterOptions {
  expectedItems: number
  falsePositiveRate: number
  hashFunctions: number
}

export interface BloomFilterStats {
  bitArraySize: number
  hashFunctionCount: number
  expectedItems: number
  falsePositiveRate: number
  itemCount: number
  fillRatio: number
  estimatedFalsePositiveRate: number
}

export const DEFAULT_BLOOM_FILTER_OPTIONS: BloomFilterOptions = {
  expectedItems: 1000,
  falsePositiveRate: 0.01,
  hashFunctions: 7,
}
