export interface HeapEntry<T> {
  id: number
  value: T
}

export interface BimodalHeapOptions<T> {
  comparator?: (a: T, b: T) => number
}

export const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
