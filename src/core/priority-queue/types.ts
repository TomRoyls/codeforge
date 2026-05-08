export type QueueOrder = 'min' | 'max'

export interface PriorityItem<T = unknown> {
  value: T
  priority: number
  insertedAt: number
}

export interface QueueOptions {
  order: QueueOrder
  maxSize: number
}

export interface QueueStats {
  size: number
  maxSize: number
  peekCount: number
  dequeueCount: number
  enqueueCount: number
}

export const DEFAULT_QUEUE_OPTIONS: QueueOptions = {
  order: 'min',
  maxSize: Infinity,
}
