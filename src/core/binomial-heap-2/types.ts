export interface BinomialHeapOptions<T> {
  comparator?: (a: T, b: T) => number
}

export interface BinomialHeapNode<T> {
  key: T
  degree: number
  parent: BinomialHeapNode<T> | null
  child: BinomialHeapNode<T> | null
  sibling: BinomialHeapNode<T> | null
}
