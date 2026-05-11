export interface PagodaOptions<T> {
  comparator?: (a: T, b: T) => number
}

export interface PagodaNode<T> {
  value: T
  left: PagodaNode<T> | null
  right: PagodaNode<T> | null
}
