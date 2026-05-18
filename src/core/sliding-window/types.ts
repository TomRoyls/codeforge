export interface SlidingWindowOptions {
  readonly maxSize: number
}

export interface SlidingWindowStatistics {
  readonly size: number
  readonly sum: number
  readonly min: number | undefined
  readonly max: number | undefined
  readonly avg: number | undefined
}

export const DEFAULT_SLIDING_WINDOW_OPTIONS: SlidingWindowOptions = {
  maxSize: 100,
}
