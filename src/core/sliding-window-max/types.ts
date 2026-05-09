export interface SlidingWindowMaxOptions {
  windowSize: number
}

export interface SlidingWindowMaxStats {
  windowSize: number
  currentSize: number
  currentMax: number | undefined
  currentMin: number | undefined
  pushCount: number
}
