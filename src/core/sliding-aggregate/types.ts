export type AggregateFn = 'sum' | 'avg' | 'min' | 'max' | 'count'

export interface SlidingAggregateOptions {
  windowSize: number
  aggregateFn?: AggregateFn
}

export interface SlidingAggregateStatistics {
  valuesAdded: number
  valuesEvicted: number
  windowSize: number
  currentSize: number
}

export const DEFAULT_SLIDING_AGGREGATE_OPTIONS: SlidingAggregateOptions = {
  windowSize: 10,
  aggregateFn: 'sum',
}
