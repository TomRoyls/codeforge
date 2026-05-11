export interface BinomialQueueOptions<T> {
  comparator?: (a: T, b: T) => number
}

export interface BinomialTreeNode<T> {
  key: T
  degree: number
  parent: BinomialTreeNode<T> | null
  child: BinomialTreeNode<T> | null
  sibling: BinomialTreeNode<T> | null
}
