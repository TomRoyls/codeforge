export type CompareFunction<K> = (a: K, b: K) => number

export interface AANode<K, V> {
  key: K
  value: V
  left: AANode<K, V> | null
  right: AANode<K, V> | null
  level: number
}

export interface AATreeOptions {
  allowDuplicates: boolean
}

export interface AATreeStats {
  nodeCount: number
  height: number
  isBalanced: boolean
  minKey: number | null
  maxKey: number | null
}

export const DEFAULT_AA_TREE_OPTIONS: AATreeOptions = {
  allowDuplicates: false,
}
