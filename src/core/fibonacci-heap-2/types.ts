export interface FibonacciHeapOptions<T> {
  comparator?: (a: T, b: T) => number
}

export interface FibonacciHeapNode<T> {
  value: T
  degree: number
  parent: FibonacciHeapNode<T> | null
  child: FibonacciHeapNode<T> | null
  left: FibonacciHeapNode<T>
  right: FibonacciHeapNode<T>
  mark: boolean
}
