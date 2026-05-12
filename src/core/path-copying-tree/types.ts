export type Comparator<K> = (a: K, b: K) => number

export interface PathCopyingTreeOptions<K, _V = unknown> {
  comparator?: Comparator<K>
}

export interface TreeEntry<K, V> {
  key: K
  value: V
}

export interface TreeNode<K, V> {
  key: K
  value: V
  left: TreeNode<K, V> | null
  right: TreeNode<K, V> | null
}
