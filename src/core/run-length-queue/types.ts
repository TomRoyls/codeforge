export interface RunLengthPair<T> {
  value: T
  count: number
}

export interface RunLengthQueueOptions<T> {
  equals?: (a: T, b: T) => boolean
}

export interface RunLengthQueueStats {
  size: number
  runCount: number
  isEmpty: boolean
  compressionRatio: number
}

export const DEFAULT_RUN_LENGTH_QUEUE_OPTIONS: RunLengthQueueOptions<unknown> = {
  equals: Object.is,
}
