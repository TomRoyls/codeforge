export type Comparator<T> = (a: T, b: T) => number

export interface AVLNode<T> {
  value: T
  left: AVLNode<T> | null
  right: AVLNode<T> | null
  height: number
  size: number
}

export interface CountedTreeOptions<T> {
  comparator?: Comparator<T>
}
