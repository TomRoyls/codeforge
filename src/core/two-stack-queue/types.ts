export interface TwoStackQueueOptions {
  trackStatistics: boolean
}

export interface TwoStackQueueStatistics {
  enqueues: number
  dequeues: number
  transfers: number
  maxEnqueueStackSize: number
  maxDequeueStackSize: number
  totalTransferCount: number
}

export const DEFAULT_TWO_STACK_QUEUE_OPTIONS: TwoStackQueueOptions = {
  trackStatistics: true,
}
