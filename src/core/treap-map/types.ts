export interface TreapNode<K, V> {
  key: K
  value: V
  left: TreapNode<K, V> | null
  right: TreapNode<K, V> | null
  priority: number
}

export type CompareFunction<K> = (a: K, b: K) => number
