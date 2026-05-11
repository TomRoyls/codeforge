export interface ScapegoatNode<K, V> {
  key: K
  value: V | undefined
  left: ScapegoatNode<K, V> | null
  right: ScapegoatNode<K, V> | null
  size: number
}

export type Comparator<K> = (a: K, b: K) => number

export interface ScapegoatTreeOptions<K> {
  alpha?: number
  compare?: Comparator<K>
}
