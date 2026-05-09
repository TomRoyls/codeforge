export interface ConcurrentQueueOptions {
  maxSize: number
}

export const DEFAULT_CONCURRENT_QUEUE_OPTIONS: ConcurrentQueueOptions = {
  maxSize: Infinity,
}

export interface ConcurrentQueueStats {
  size: number
  isEmpty: boolean
  isFull: boolean
  maxSize: number
  totalEnqueued: number
  totalDequeued: number
  totalRejected: number
  priorityCount: number
}
