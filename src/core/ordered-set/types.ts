export interface OrderedSetOptions {
  readonly initialCapacity?: number
}

export interface OrderedSetStats {
  readonly size: number
  readonly capacity: number
}

export const DEFAULT_ORDERED_SET_OPTIONS: OrderedSetOptions = {
  initialCapacity: 16,
}
