export interface IntervalSkipListOptions {
  maxLevel?: number
  probability?: number
}

export interface IntervalSkipListStatistics {
  inserts: number
  removes: number
  queries: number
  maxLevel: number
  levelDistribution: Record<number, number>
  avgNodesPerLevel: number
}

export interface IntervalEntry<T> {
  low: number
  high: number
  value?: T
}

export interface IntervalNode<T> {
  low: number
  high: number
  value: T | undefined
  forward: (IntervalNode<T> | null | undefined)[]
  maxHigh: number
}

export const DEFAULT_INTERVAL_SKIPLIST_OPTIONS: Required<IntervalSkipListOptions> = {
  maxLevel: 16,
  probability: 0.5,
}
