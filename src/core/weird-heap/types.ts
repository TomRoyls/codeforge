export interface WeirdHeapNode<T> {
  value: T
  rank: number
  parent: WeirdHeapNode<T> | null
  child: WeirdHeapNode<T> | null
  sibling: WeirdHeapNode<T> | null
  weird: boolean
}

export interface WeirdHeapOptions {
  comparator?: (a: unknown, b: unknown) => number
}

export const DEFAULT_WEIRD_HEAP_OPTIONS: WeirdHeapOptions = {}
