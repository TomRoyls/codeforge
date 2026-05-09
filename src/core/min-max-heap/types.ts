export interface HeapItem<T> {
  priority: number
  value: T
}

export interface MinMaxHeapOptions {
  initialCapacity: number
}

export const DEFAULT_MINMAX_HEAP_OPTIONS: MinMaxHeapOptions = {
  initialCapacity: 16,
}
