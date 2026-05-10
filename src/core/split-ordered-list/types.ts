export interface SplitOrderedListOptions {
  initialBuckets?: number;
  loadFactor?: number;
}

export interface SplitOrderedListStatistics {
  inserts: number;
  deletes: number;
  lookups: number;
  resizes: number;
  bucketCount: number;
}

export const DEFAULT_SPLIT_ORDERED_LIST_OPTIONS: Required<SplitOrderedListOptions> = {
  initialBuckets: 16,
  loadFactor: 0.75,
};
