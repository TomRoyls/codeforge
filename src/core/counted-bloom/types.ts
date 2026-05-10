export interface CountedBloomFilterOptions {
  expectedItems?: number
  falsePositiveRate?: number
  counterBits?: number
}

export interface CountedBloomFilterStatistics {
  adds: number
  removes: number
  lookups: number
  overflows: number
  estimatedFalsePositives: number
}

export interface CountedBloomFilterJSON {
  counters: number[]
  counterBits: number
  bucketCount: number
  hashCount: number
  expectedItems: number
  targetFalsePositiveRate: number
  size: number
  statistics: CountedBloomFilterStatistics
}

export const DEFAULT_COUNTED_BLOOM_OPTIONS: Required<CountedBloomFilterOptions> = {
  expectedItems: 1000,
  falsePositiveRate: 0.01,
  counterBits: 4,
}
