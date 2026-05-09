export type EvictionPolicy = 'fifo' | 'lru' | 'random'

export interface BoundedQueueOptions {
  capacity: number
  policy: EvictionPolicy
}

export interface BoundedQueueStats {
  capacity: number
  size: number
  isEmpty: boolean
  isFull: boolean
  policy: EvictionPolicy
  totalEnqueued: number
  totalDequeued: number
  totalEvicted: number
}

export const DEFAULT_BOUNDED_QUEUE_OPTIONS: BoundedQueueOptions = {
  capacity: 64,
  policy: 'fifo',
}
