export interface CTNode<T> {
  value: T
  index: number
  left: CTNode<T> | null
  right: CTNode<T> | null
}

export type CompareFn<T> = (a: T, b: T) => number

export function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
