export interface HashSetOptions<T> {
  readonly capacity?: number
  readonly loadFactorThreshold?: number
  readonly minLoadFactor?: number
  readonly hash?: (value: T) => number
  readonly equals?: (a: T, b: T) => boolean
}

export interface HashSetStats {
  readonly size: number
  readonly capacity: number
  readonly loadFactor: number
  readonly tombstones: number
}

export const DEFAULT_HASH_SET_OPTIONS: HashSetOptions<never> = {
  capacity: 16,
  loadFactorThreshold: 0.75,
  minLoadFactor: 0.25,
}
