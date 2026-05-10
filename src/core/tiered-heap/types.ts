export interface TieredHeapOptions<T> {
  tiers: number
  comparator?: (a: T, b: T) => number
}

export const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
