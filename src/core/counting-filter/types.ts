export interface CountingFilterOptions {
  expectedItems: number
  falsePositiveRate: number
  counterBits?: 8 | 16
}

export interface CountingFilterJSON {
  counters: number[]
  counterCount: number
  hashCount: number
  expectedItems: number
  targetFalsePositiveRate: number
  itemCount: number
  counterBits: 8 | 16
}

export interface CountingFilterStats {
  counterCount: number
  hashCount: number
  expectedItems: number
  targetFalsePositiveRate: number
  size: number
  capacity: number
  falsePositiveRate: number
  fillRatio: number
  counterBits: 8 | 16
  usedCounters: number
  maxCounter: number
}

export const DEFAULT_COUNTING_FILTER_OPTIONS: CountingFilterOptions = {
  expectedItems: 1000,
  falsePositiveRate: 0.01,
  counterBits: 8,
}
