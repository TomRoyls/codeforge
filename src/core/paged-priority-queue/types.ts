export interface PagedPriorityQueueOptions<T> {
  pageSize?: number
  comparator?: (a: T, b: T) => number
}

export interface Page<T> {
  elements: T[]
  size: number
}

export const DEFAULT_PAGE_SIZE = 64

export const DEFAULT_COMPARATOR = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
