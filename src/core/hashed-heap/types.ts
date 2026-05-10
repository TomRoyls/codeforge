export interface HashedHeapOptions {
  comparator?: (a: number, b: number) => number
}

export interface HeapEntry<K, T> {
  key: K
  value: T
  priority: number
}
