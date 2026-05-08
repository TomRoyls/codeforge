export interface TreapNode<T> {
  key: number
  value: T
  priority: number
  left: TreapNode<T> | null
  right: TreapNode<T> | null
}

export interface TreapOptions {
  allowDuplicates: boolean
}

export interface TreapStats {
  nodeCount: number
  height: number
  isBalanced: boolean
}

export const DEFAULT_TREAP_OPTIONS: TreapOptions = {
  allowDuplicates: false,
}
