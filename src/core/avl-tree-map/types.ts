export interface AVLNode<K, V> {
  key: K
  value: V
  left: AVLNode<K, V> | null
  right: AVLNode<K, V> | null
  height: number
}

export type CompareFunction<K> = (a: K, b: K) => number
