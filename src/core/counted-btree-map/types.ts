export interface CountedBTreeMapNode<K, V> {
  keys: K[]
  values: V[]
  children: CountedBTreeMapNode<K, V>[]
  counts: number[]
  isLeaf: boolean
}

export const DEFAULT_COUNTED_BTREEMAP_ORDER = 32
