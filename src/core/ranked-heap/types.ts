export type RankedHeapComparator = 'min' | 'max'

export interface RankedHeapOptions {
  comparator?: RankedHeapComparator
}

export interface RankedHeapStatistics {
  pushes: number
  pops: number
  rankQueries: number
  scoreUpdates: number
  deletes: number
  maxSize: number
}

export interface RankedHeapEntry<T> {
  value: T
  score: number
}

export interface RankedHeapJSON<T> {
  entries: RankedHeapEntry<T>[]
  comparator: RankedHeapComparator
  statistics: RankedHeapStatistics
}

export const DEFAULT_RANKED_HEAP_OPTIONS: Required<RankedHeapOptions> = {
  comparator: 'max',
}
