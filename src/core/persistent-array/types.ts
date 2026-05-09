export interface TreeNode<T> {
  readonly value: T
  readonly left: TreeNode<T> | null
  readonly right: TreeNode<T> | null
  readonly height: number
  readonly size: number
}

export type ElementComparator<T> = (a: T, b: T) => boolean
