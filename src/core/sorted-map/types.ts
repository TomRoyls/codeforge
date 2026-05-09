export interface SortedMapNode<K, V> {
  key: K
  value: V
  left: SortedMapNode<K, V> | null
  right: SortedMapNode<K, V> | null
  height: number
}

export type CompareFunction<K> = (a: K, b: K) => number

export interface SortedMapOptions<K> {
  compare?: CompareFunction<K>
}

export interface SortedMapStats {
  size: number
  height: number
  isBalanced: boolean
}

export type SortedMapEntry<K, V> = [K, V]
