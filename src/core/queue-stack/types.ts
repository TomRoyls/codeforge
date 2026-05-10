export interface QueueStackOptions {
  initialCapacity?: number
}

export interface QueueStackStatistics {
  queuePushes: number
  stackPushes: number
  pops: number
  queuePops: number
  stackPops: number
}

export const DEFAULT_QUEUE_STACK_OPTIONS: Required<QueueStackOptions> = {
  initialCapacity: 16,
}
