export const DEFAULT_PAGED_ARRAY_OPTIONS: PagedArrayOptions = {
  pageSize: 1024,
}

export interface PagedArrayOptions {
  pageSize?: number
}

export interface PagedArrayStatistics {
  pushes: number
  pops: number
  sets: number
  gets: number
  pagesAllocated: number
  pagesFreed: number
  compactions: number
}
