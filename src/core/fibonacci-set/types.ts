export type Comparator<T> = (a: T, b: T) => number

export interface FibonacciSetOptions<T> {
  compare?: Comparator<T>
}

export interface FibNode<T> {
  value: T
  degree: number
  mark: boolean
  parent: FibNode<T> | null
  child: FibNode<T> | null
  left: FibNode<T>
  right: FibNode<T>
}
