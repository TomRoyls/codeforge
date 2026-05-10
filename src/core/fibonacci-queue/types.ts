export interface FibonacciQueueOptions<T = number> {
  comparator?: (a: T, b: T) => number
}

export interface FibonacciQueueNode<T> {
  value: T
  priority: number
  degree: number
  mark: boolean
  left: FibonacciQueueNode<T>
  right: FibonacciQueueNode<T>
  child: FibonacciQueueNode<T> | null
  parent: FibonacciQueueNode<T> | null
}
