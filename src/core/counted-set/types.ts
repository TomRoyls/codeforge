export interface CountedSetOptions {
  initialEntries?: Iterable<[unknown, number]>
}

export interface CountedSetStatistics {
  adds: number
  removes: number
  totalCount: number
  maxCount: number
  uniqueElements: number
}

export interface CountedSetJSON<T> {
  entries: Array<[T, number]>
  statistics: CountedSetStatistics
}

export const DEFAULT_COUNTED_SET_OPTIONS: Required<CountedSetOptions> = {
  initialEntries: [],
}
