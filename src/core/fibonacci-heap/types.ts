export type CompareFunction<T> = (a: T, b: T) => number

export const DEFAULT_COMPARE: CompareFunction<number> = (a, b) => a - b

export interface FibonacciNode<T = number> {
  value: T
  degree: number
  marked: boolean
  parent: FibonacciNode<T> | null
  child: FibonacciNode<T> | null
  left: FibonacciNode<T>
  right: FibonacciNode<T>
}
