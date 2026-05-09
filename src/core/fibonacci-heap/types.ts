export interface FibNode<T> {
  key: number
  value: T
  degree: number
  marked: boolean
  parent: FibNode<T> | null
  child: FibNode<T> | null
  left: FibNode<T>
  right: FibNode<T>
}

export interface FibonacciHeapOptions {}

export const DEFAULT_FIBONACCIHEAP_OPTIONS: FibonacciHeapOptions = {}
