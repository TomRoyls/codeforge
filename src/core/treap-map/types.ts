export interface TreapNode<K, V> {
  key: K
  value: V
  priority: number
  left: TreapNode<K, V> | null
  right: TreapNode<K, V> | null
  size: number
}

export interface TreapMapOptions<K, V> {
  comparator?: (a: K, b: K) => number
  entries?: [K, V][]
}

export interface TreapEntry<K, V> {
  key: K
  value: V
}

export const defaultComparator = (a: unknown, b: unknown): number => {
  if (a === b) return 0
  if (a === undefined) return -1
  if (b === undefined) return 1
  if (a === null) return -1
  if (b === null) return 1
  if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : 1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a) < String(b) ? -1 : 1
}
