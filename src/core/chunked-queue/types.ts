export const DEFAULT_CHUNKED_QUEUE_OPTIONS: ChunkedQueueOptions = {
  chunkSize: 64,
}

export interface ChunkedQueueOptions {
  chunkSize?: number
}

export interface ChunkedQueueStatistics {
  enqueues: number
  dequeues: number
  chunksCreated: number
  chunksReleased: number
  compactions: number
}
