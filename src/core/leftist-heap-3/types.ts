export type Comparator<T> = (a: T, b: T) => number

export interface LeftistHeap3Options<T> {
  comparator?: Comparator<T>
}

export interface LeftistHeap3Node<T> {
  value: T
  left: LeftistHeap3Node<T> | null
  right: LeftistHeap3Node<T> | null
  npl: number
}
