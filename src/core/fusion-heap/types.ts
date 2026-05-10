export interface FusionHeapOptions<T> {
  comparator: (a: T, b: T) => number
}

export interface FusionHeapStatistics {
  inserts: number
  extracts: number
  decreaseKeys: number
  deletes: number
  merges: number
  consolidations: number
  maxSize: number
}

const defaultCompare = (a: number, b: number): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export const DEFAULT_FUSION_HEAP_OPTIONS: Omit<FusionHeapOptions<unknown>, 'comparator'> & {
  comparator: (a: number, b: number) => number
} = {
  comparator: defaultCompare,
}
