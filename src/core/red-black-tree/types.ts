export type Color = 'red' | 'black'

export interface RBNode<T> {
  key: number
  value: T
  color: Color
  left: RBNode<T> | null
  right: RBNode<T> | null
  parent: RBNode<T> | null
}

export interface RBTreeOptions {
  allowDuplicates: boolean
}

export interface RBTreeStats {
  nodeCount: number
  blackHeight: number
  isBalanced: boolean
  minKey: number | null
  maxKey: number | null
}

export const DEFAULT_RB_TREE_OPTIONS: RBTreeOptions = {
  allowDuplicates: false,
}
