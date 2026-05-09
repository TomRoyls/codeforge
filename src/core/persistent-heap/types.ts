export interface PersistentHeapOptions<T> {
  comparator?: (a: T, b: T) => number
}

export interface PersistentHeapNode<T> {
  value: T
  left?: PersistentHeapNode<T>
  right?: PersistentHeapNode<T>
  rank: number
}
