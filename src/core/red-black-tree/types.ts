export type RBColor = 'red' | 'black'

export interface RBNode<K, V> {
  key: K
  value: V
  color: RBColor
  left: RBNode<K, V> | null
  right: RBNode<K, V> | null
  parent: RBNode<K, V> | null
}

export type CompareFunction<K> = (a: K, b: K) => number
