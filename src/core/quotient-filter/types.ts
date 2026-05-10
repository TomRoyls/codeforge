export interface QuotientFilterOptions {
  expectedItems: number
  falsePositiveRate: number
}

export interface QuotientFilterStats {
  size: number
  capacity: number
  loadFactor: number
  falsePositiveRate: number
  quotientBits: number
  remainderBits: number
}

export const DEFAULT_QUOTIENT_FILTER_OPTIONS: QuotientFilterOptions = {
  expectedItems: 1000,
  falsePositiveRate: 0.01,
}
