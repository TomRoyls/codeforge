export interface LeftistHeapOptions<T> {
  comparator?: (a: T, b: T) => number
}

export interface LeftistHeapNode<T> {
  value: T
  left: LeftistHeapNode<T> | null
  right: LeftistHeapNode<T> | null
  npl: number
}
