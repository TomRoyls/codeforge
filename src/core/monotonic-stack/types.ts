export interface MonotonicStackOptions<T> {
  mode?: 'increasing' | 'decreasing'
  comparator?: (a: T, b: T) => number
}

export interface MonotonicStackStats {
  size: number
  isEmpty: boolean
  mode: 'increasing' | 'decreasing'
  totalPushed: number
  totalPopped: number
}

export const defaultComparator = <T>(a: T, b: T): number => {
  if (a === b) return 0
  return a < b ? -1 : a > b ? 1 : 0
}
