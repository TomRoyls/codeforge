export interface ExtendibleHashOptions {
  bucketCapacity?: number;
  initialDepth?: number;
}

export interface ExtendibleHashStatistics {
  splits: number;
  directoryDoublings: number;
  totalBuckets: number;
  totalEntries: number;
}

export interface BucketEntry<K, V> {
  key: K;
  value: V;
}

export const DEFAULT_EXTENDIBLE_HASH_OPTIONS: Required<ExtendibleHashOptions> = {
  bucketCapacity: 4,
  initialDepth: 1,
};
