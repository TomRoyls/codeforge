export interface IntervalHeapMapOptions<K> {
  comparator?: (a: K, b: K) => number
}

export interface IntervalHeapNode<K, V> {
  minKey: K
  minValue: V
  maxKey: K | null
  maxValue: V | null
}
