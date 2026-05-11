export interface FibHeapOptions<T> {
  comparator?: (a: T, b: T) => number
}

export interface FibHeapNode<T> {
  value: T
  degree: number
  parent: FibHeapNode<T> | null
  child: FibHeapNode<T> | null
  left: FibHeapNode<T>
  right: FibHeapNode<T>
  mark: boolean
}
