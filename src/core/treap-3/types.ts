export interface TreapNode<K, V> {
  key: K
  left: null | TreapNode<K, V>
  priority: number
  right: null | TreapNode<K, V>
  value: V
}
