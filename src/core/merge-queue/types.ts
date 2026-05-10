export interface MergeQueueOptions<T> {
  comparator?: (a: T, b: T) => number
}

export interface MergeNode<T> {
  value: T
  left: MergeNode<T> | null
  right: MergeNode<T> | null
  rank: number
}
