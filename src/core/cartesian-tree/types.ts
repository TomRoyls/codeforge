export interface CartesianNode<T> {
  value: T
  index: number
  left: CartesianNode<T> | null
  right: CartesianNode<T> | null
  parent: CartesianNode<T> | null
}

export interface CartesianTreeOptions<T> {
  values: T[]
  comparator?: (a: T, b: T) => number
  heapProperty?: 'min' | 'max'
}

export function defaultComparator<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
