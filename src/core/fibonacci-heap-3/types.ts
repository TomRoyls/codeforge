export interface FibonacciHeap3Options<T> {
  comparator?: (a: T, b: T) => number
}

export interface FibonacciHeap3Node<T> {
  value: T
  degree: number
  parent: FibonacciHeap3Node<T> | null
  child: FibonacciHeap3Node<T> | null
  left: FibonacciHeap3Node<T>
  right: FibonacciHeap3Node<T>
  mark: boolean
}
