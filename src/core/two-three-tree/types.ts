export interface TwoThreeNode<T> {
  keys: T[]
  children: TwoThreeNode<T>[]
}

export interface SplitResult<T> {
  key: T
  rightNode: TwoThreeNode<T>
}

export const DEFAULT_COMPARE = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
