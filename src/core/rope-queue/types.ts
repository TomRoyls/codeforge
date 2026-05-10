export interface RopeQueueOptions {
  leafSize: number
}

export interface RopeQueueStats {
  size: number
  leafCount: number
  depth: number
  isEmpty: boolean
  totalEnqueued: number
  totalDequeued: number
  totalBulkEnqueued: number
  totalBulkDequeued: number
  leafSize: number
}

export const DEFAULT_ROPE_QUEUE_OPTIONS: RopeQueueOptions = {
  leafSize: 64,
}
