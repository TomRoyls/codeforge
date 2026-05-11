export interface StreamingQuantileOptions<T> {
  error?: number
  comparator?: (a: T, b: T) => number
}

export const DEFAULT_COMPARATOR = <T>(a: T, b: T): number => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }
  const sa = String(a)
  const sb = String(b)
  if (sa < sb) return -1
  if (sa > sb) return 1
  return 0
}
