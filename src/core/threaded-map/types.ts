export type Comparator<K> = (a: K, b: K) => number

export interface ThreadedNode<K, V> {
  key: K
  value: V
  left: ThreadedNode<K, V> | null
  right: ThreadedNode<K, V> | null
  leftThread: boolean
  rightThread: boolean
}

export interface ThreadedMapOptions<K> {
  comparator?: Comparator<K>
}
