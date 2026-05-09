export interface BTreeMapNode<K, V> {
  keys: K[]
  values: V[]
  children: BTreeMapNode<K, V>[]
  isLeaf: boolean
}

export const DEFAULT_BTREEMAP_ORDER = 3
