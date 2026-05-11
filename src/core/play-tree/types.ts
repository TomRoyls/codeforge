export interface PlayTreeNode<T> {
  value: T
  left: PlayTreeNode<T> | null
  right: PlayTreeNode<T> | null
}

export type CompareFunction<T> = (a: T, b: T) => number

export interface PlayTreeOptions<T = unknown> {
  comparator?: CompareFunction<T>
}
