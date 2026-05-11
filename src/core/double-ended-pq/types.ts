export interface DoubleEndedPQOptions<T> {
  comparator?: (a: T, b: T) => number
}

export const DEFAULT_COMPARATOR = <T,>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
