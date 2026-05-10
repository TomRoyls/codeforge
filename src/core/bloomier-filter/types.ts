export interface BloomierFilterOptions<V> {
  defaultValue?: V
  tableSize?: number
}

export interface BloomierFilterStats {
  size: number
  tableSize: number
  loadFactor: number
  numHashes: number
}

export const DEFAULT_BLOOMIER_TABLE_MULTIPLIER = 2
