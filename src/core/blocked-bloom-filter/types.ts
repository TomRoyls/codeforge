export interface BlockedBloomFilterOptions {
  expectedItems: number
  falsePositiveRate: number
  blockSize: number
}

export interface BlockedBloomFilterStatistics {
  adds: number
  lookups: number
  blocks: number
  hashComputations: number
  estimatedFalsePositives: number
}

export interface BlockedBloomFilterJSON {
  blocks: number[][]
  blockSize: number
  blockCount: number
  hashCount: number
  expectedItems: number
  targetFalsePositiveRate: number
  itemCount: number
  statistics: BlockedBloomFilterStatistics
}

export const DEFAULT_BLOCKED_BLOOM_FILTER_OPTIONS: BlockedBloomFilterOptions = {
  expectedItems: 1000,
  falsePositiveRate: 0.01,
  blockSize: 256,
}
