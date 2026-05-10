export interface SortedSegmentOptions {
  segmentCapacity?: number
  comparator?: (a: number, b: number) => number
}

export interface SortedSegmentStatistics {
  inserts: number
  merges: number
  segments: number
  rebalances: number
}

export const DEFAULT_SORTED_SEGMENT_OPTIONS: SortedSegmentOptions = {
  segmentCapacity: 64,
}
