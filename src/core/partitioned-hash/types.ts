export interface PartitionedHashOptions {
  partitionCount?: number;
  loadFactor?: number;
}

export interface PartitionedHashStatistics {
  inserts: number;
  deletes: number;
  lookups: number;
  rebalances: number;
  maxPartitionSize: number;
  minPartitionSize: number;
}

export const DEFAULT_PARTITIONED_HASH_OPTIONS: Required<PartitionedHashOptions> = {
  partitionCount: 16,
  loadFactor: 0.75,
};
