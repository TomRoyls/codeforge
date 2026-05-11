export interface WBTNode<K, V> {
  key: K
  value: V | undefined
  left: WBTNode<K, V> | null
  right: WBTNode<K, V> | null
  size: number
}

export type CompareFunction<K> = (a: K, b: K) => number

export interface WeightBalancedTreeOptions<K> {
  compare?: CompareFunction<K>
}
