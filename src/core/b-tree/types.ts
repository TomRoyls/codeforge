export interface BTreeNode<T> {
  keys: number[]
  values: T[]
  children: BTreeNode<T>[]
  isLeaf: boolean
}

export interface BTreeOptions {
  order: number
}

export interface BTreeStats {
  nodeCount: number
  height: number
  keyCount: number
  order: number
}

export const DEFAULT_BTREE_OPTIONS: BTreeOptions = {
  order: 3,
}
