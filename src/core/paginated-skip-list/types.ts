export interface PaginatedSkipListOptions<T> {
  maxLevel?: number
  probability?: number
  comparator?: (a: T, b: T) => number
  initialValues?: T[]
}

export interface PageInfo<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface CursorPage<T> {
  items: T[]
  cursor: T | null
  hasMore: boolean
}

export interface RangePage<T> {
  items: T[]
  rangeStart: T
  rangeEnd: T
}

export interface SkipNode<T> {
  value: T
  forward: (SkipNode<T> | null)[]
}

export const DEFAULT_MAX_LEVEL = 16
export const DEFAULT_PROBABILITY = 0.5
