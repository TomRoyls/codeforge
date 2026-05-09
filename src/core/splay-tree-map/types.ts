export interface SplayNode<K, V> {
  key: K
  value: V
  left: SplayNode<K, V> | null
  right: SplayNode<K, V> | null
  parent: SplayNode<K, V> | null
}

export type CompareFunction<K> = (a: K, b: K) => number
