export interface ShuffleBufferOptions {
  readonly capacity: number
}

export interface ShuffleBufferStatistics {
  readonly pushes: number
  readonly pops: number
  readonly shuffles: number
  readonly samples: number
  readonly swaps: number
  readonly reverses: number
}

export const DEFAULT_SHUFFLE_BUFFER_OPTIONS: Required<ShuffleBufferOptions> = {
  capacity: 1024,
}
