export interface VectorHeapOptions<T> {
  arity: number
  comparator: (a: T, b: T) => number
}

export interface VectorHeapStatistics {
  pushes: number
  pops: number
  heapifies: number
  merges: number
  updates: number
  removes: number
  siftUps: number
  siftDowns: number
}

const defaultCompare = (a: number, b: number): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export const DEFAULT_VECTOR_HEAP_OPTIONS: Omit<VectorHeapOptions<unknown>, 'comparator'> & {
  comparator: (a: number, b: number) => number
} = {
  arity: 4,
  comparator: defaultCompare,
}
