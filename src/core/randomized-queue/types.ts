export interface RandomizedQueueOptions {
  readonly initialCapacity?: number
}

export interface RandomizedQueueStats {
  readonly size: number
  readonly capacity: number
}

export const DEFAULT_RANDOMIZED_QUEUE_OPTIONS: RandomizedQueueOptions = {
  initialCapacity: 16,
}
