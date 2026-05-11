export interface RadixHeapOptions<T> {
  keyExtractor?: (value: T) => number
  radix?: number
}

export interface RadixHeapNode<T> {
  key: number
  value: T
  bucket: number
  prev: RadixHeapNode<T> | null
  next: RadixHeapNode<T> | null
}
