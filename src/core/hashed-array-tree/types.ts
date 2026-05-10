export interface HashedArrayTreeOptions {
  initialCapacity?: number
  growthFactor?: number
}

export interface HashedArrayTreeStatistics {
  resizes: number
  totalCapacity: number
  wastedSpace: number
}

export const DEFAULT_HASHED_ARRAY_TREE_OPTIONS: Required<HashedArrayTreeOptions> = {
  initialCapacity: 16,
  growthFactor: 2,
}
