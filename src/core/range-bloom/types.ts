export interface RangeBloomOptions {
  expectedItems?: number
  falsePositiveRate?: number
  layers?: number
}

export const DEFAULT_RANGE_BLOOM_OPTIONS: Required<RangeBloomOptions> = {
  expectedItems: 1000,
  falsePositiveRate: 0.01,
  layers: 3,
}
