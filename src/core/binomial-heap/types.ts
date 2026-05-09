export interface BinomialNode<T> {
  value: T
  degree: number
  parent: BinomialNode<T> | null
  child: BinomialNode<T> | null
  sibling: BinomialNode<T> | null
}

export interface BinomialHeapOptions {
  comparator?: (a: unknown, b: unknown) => number
}

export const DEFAULT_BINOMIAL_HEAP_OPTIONS: BinomialHeapOptions = {}
