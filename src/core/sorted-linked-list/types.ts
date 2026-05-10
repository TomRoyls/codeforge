export interface SortedListOptions<T = unknown> {
  comparator?: (a: T, b: T) => number
}

export interface SortedListStatistics {
  inserts: number
  removes: number
  finds: number
  merges: number
  maxSize: number
}

export interface SortedListJSON<T> {
  values: T[]
  statistics: SortedListStatistics
}

export const DEFAULT_SORTED_LIST_OPTIONS: Required<SortedListOptions> = {
  comparator: (a: unknown, b: unknown): number => {
    if (a === b) return 0
    if (a === undefined) return -1
    if (b === undefined) return 1
    if (a === null) return -1
    if (b === null) return 1
    if (typeof a === 'number' && typeof b === 'number') return a - b
    return String(a).localeCompare(String(b))
  },
}
