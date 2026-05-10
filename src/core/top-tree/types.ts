export type CompareFunction<K> = (a: K, b: K) => number

export interface TopTreeNode<K, V> {
  key: K
  value: V
  left: TopTreeNode<K, V> | null
  right: TopTreeNode<K, V> | null
  parent: TopTreeNode<K, V> | null
  aggregateSum: number
  aggregateMin: number
  aggregateMax: number
  aggregateCount: number
}

export type AggregateType = 'sum' | 'min' | 'max' | 'count'

export interface TopTreeOptions {
  aggregate: AggregateType
}

export interface TopTreeStats {
  nodeCount: number
  height: number
  isBalanced: boolean
  minKey: number | null
  maxKey: number | null
}

export const DEFAULT_TOP_TREE_OPTIONS: TopTreeOptions = {
  aggregate: 'sum',
}
