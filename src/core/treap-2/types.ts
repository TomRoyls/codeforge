export interface TreapNode<K, V> {
  key: K
  value: V | undefined
  priority: number
  left: TreapNode<K, V> | null
  right: TreapNode<K, V> | null
  size: number
}

export type CompareFunction<K> = (a: K, b: K) => number

export interface TreapOptions<K> {
  compare?: CompareFunction<K>
}
