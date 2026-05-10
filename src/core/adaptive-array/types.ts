export type GrowthStrategy = 'exponential' | 'linear' | 'fibonacci' | 'fixed'

export interface AdaptiveArrayOptions {
  initialCapacity: number
  growthFactor: number
  shrinkThreshold: number
  strategy: GrowthStrategy
}

export interface AdaptiveArrayStatistics {
  resizeCount: number
  copyCount: number
  totalElementsMoved: number
  currentCapacity: number
  currentSize: number
  strategy: GrowthStrategy
  growthCount: number
  shrinkCount: number
}

export const DEFAULT_ADAPTIVE_ARRAY_OPTIONS: AdaptiveArrayOptions = {
  initialCapacity: 16,
  growthFactor: 2,
  shrinkThreshold: 0.25,
  strategy: 'exponential',
}
