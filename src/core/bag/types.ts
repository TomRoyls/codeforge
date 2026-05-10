export interface BagOptions<T> {
  readonly hash?: (value: T) => string
}

export interface BagStats {
  readonly size: number
  readonly uniqueSize: number
  readonly minCount: number
  readonly maxCount: number
  readonly meanCount: number
}
