export type HeapComparator = 'min' | 'max'

export interface HeapOptions {
  comparator: HeapComparator
}

export const DEFAULT_HEAP_OPTIONS: HeapOptions = {
  comparator: 'min',
}
