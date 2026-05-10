export interface PartitionedSetOptions {
  trackStatistics?: boolean
}

export interface PartitionedSetStatistics {
  makeSetCalls: number
  findCalls: number
  unionCalls: number
  successfulUnions: number
  pathCompressions: number
  maxRank: number
}

export interface PartitionedSetJSON<T> {
  elements: T[]
  parent: number[]
  rank: number[]
  partitionCount: number
  statistics: PartitionedSetStatistics
}

export const DEFAULT_PARTITIONED_SET_OPTIONS: Required<PartitionedSetOptions> = {
  trackStatistics: true,
}
