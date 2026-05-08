export interface AVLNode<T> {
  key: number
  value: T
  left: AVLNode<T> | null
  right: AVLNode<T> | null
  height: number
}

export interface AVLTreeOptions {
  allowDuplicates: boolean
}

export interface AVLTreeStats {
  nodeCount: number
  height: number
  isBalanced: boolean
  minKey: number | null
  maxKey: number | null
}

export const DEFAULT_AVL_TREE_OPTIONS: AVLTreeOptions = {
  allowDuplicates: false,
}
