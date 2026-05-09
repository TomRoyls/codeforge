export interface OSTNode<T> {
  value: T
  priority: number
  left: OSTNode<T> | null
  right: OSTNode<T> | null
  size: number
}

export interface OrderStatisticTreeOptions<T> {
  comparator?: (a: T, b: T) => number
}

export const defaultComparator = (a: unknown, b: unknown): number => {
  if (a === b) return 0
  if (a === undefined) return -1
  if (b === undefined) return 1
  if (a === null) return -1
  if (b === null) return 1
  if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : 1
  if (typeof a === 'number' && typeof b === 'number') return a - (b as number)
  return String(a) < String(b) ? -1 : 1
}
