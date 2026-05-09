export interface SkewHeapOptions<T> {
  comparator?: (a: T, b: T) => number
}

export interface SkewHeapNode<T> {
  value: T
  left: SkewHeapNode<T> | null
  right: SkewHeapNode<T> | null
}
