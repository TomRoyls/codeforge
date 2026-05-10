export interface KWayMergeOptions<T> {
  comparator?: (a: T, b: T) => number
}

export interface HeapEntry<T> {
  value: T
  sourceIndex: number
}

export const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
