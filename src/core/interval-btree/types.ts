export interface Interval {
  start: number
  end: number
}

export interface IntervalBTreeOptions {
  degree?: number
}

export interface IntervalBTreeStatistics {
  inserts: number
  deletes: number
  queries: number
  overlapChecks: number
}

export const DEFAULT_INTERVAL_BTREE_OPTIONS: IntervalBTreeOptions = {
  degree: 32,
}
