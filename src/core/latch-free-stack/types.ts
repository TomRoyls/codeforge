export interface LatchFreeStackOptions {
  trackStatistics: boolean
  simulateCasFailures: number
}

export interface LatchFreeStackStatistics {
  pushes: number
  pops: number
  casFailures: number
  maxSize: number
  currentSize: number
  totalSpinAttempts: number
}

export const DEFAULT_LATCH_FREE_STACK_OPTIONS: LatchFreeStackOptions = {
  trackStatistics: true,
  simulateCasFailures: 0,
}
