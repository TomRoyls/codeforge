export interface RandomizedSetOptions {
  readonly initialCapacity?: number
}

export interface RandomizedSetStats {
  readonly size: number
  readonly capacity: number
}

export const DEFAULT_RANDOMIZED_SET_OPTIONS: RandomizedSetOptions = {
  initialCapacity: 16,
}
