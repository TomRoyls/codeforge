export const DEFAULT_TIERED_VECTOR_OPTIONS: TieredVectorOptions = {
  baseSize: 32,
}

export interface TieredVectorOptions {
  baseSize?: number
}

export interface TieredVectorStatistics {
  inserts: number
  deletes: number
  accesses: number
  rebalances: number
  maxTierSize: number
}
