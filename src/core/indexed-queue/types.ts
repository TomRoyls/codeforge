export interface IndexedQueueOptions {
  initialCapacity: number
  growthFactor: number
}

export const DEFAULT_INDEXED_QUEUE_OPTIONS: IndexedQueueOptions = {
  initialCapacity: 16,
  growthFactor: 2,
}
