export interface LockFreeQueueOptions {
  trackStatistics?: boolean
  simulateCasFailures?: boolean
}

export interface LockFreeQueueStatistics {
  enqueues: number
  dequeues: number
  casFailures: number
  maxSize: number
  totalSpinAttempts: number
  currentSize: number
}

export interface LockFreeQueueJSON<T> {
  items: T[]
  options: Required<LockFreeQueueOptions>
  statistics: LockFreeQueueStatistics
}

export const DEFAULT_LOCK_FREE_QUEUE_OPTIONS: Required<LockFreeQueueOptions> = {
  trackStatistics: false,
  simulateCasFailures: false,
}
