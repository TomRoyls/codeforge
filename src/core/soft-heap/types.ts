export interface SoftHeapOptions<T> {
  errorRate?: number
  comparator?: (a: T, b: T) => number
}

export interface SoftHeapNode<T> {
  ckey: T
  items: T[]
  rank: number
  child: SoftHeapNode<T> | null
  next: SoftHeapNode<T> | null
  _itemOffset?: number
}

export const DEFAULT_SOFT_HEAP_OPTIONS: SoftHeapOptions<unknown> = {
  errorRate: 0.1,
}
