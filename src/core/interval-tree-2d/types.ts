export interface RectEntry<V> {
  x1: number
  y1: number
  x2: number
  y2: number
  value: V
}

export interface TreeNode<V> {
  key: number
  entries: RectEntry<V>[]
  max: number
  left: TreeNode<V> | null
  right: TreeNode<V> | null
}
