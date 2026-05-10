export interface StringBloomFilterOptions {
  expectedItems: number
  falsePositiveRate: number
}

export interface StringBloomFilterStatistics {
  estimatedSize: number
  expectedFalsePositiveRate: number
  fillRatio: number
  bitCount: number
  hashCount: number
  capacity: number
  isEmpty: boolean
}

export interface StringBloomFilterJSON {
  counters: number[]
  bitCount: number
  hashCount: number
  expectedItems: number
  targetFalsePositiveRate: number
  itemCount: number
}

export const DEFAULT_STRING_BLOOM_OPTIONS: StringBloomFilterOptions = {
  expectedItems: 1000,
  falsePositiveRate: 0.01,
}
