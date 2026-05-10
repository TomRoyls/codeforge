export interface TemporalEntry<V> {
  timestamp: number
  value: V
}

export interface TemporalNode<K, V> {
  key: K
  timeline: Map<number, V>
  left: TemporalNode<K, V> | null
  right: TemporalNode<K, V> | null
}

export interface TemporalBSTOptions<K, V> {
  comparator?: (a: K, b: K) => number
  entries?: [K, V, number][]
}
