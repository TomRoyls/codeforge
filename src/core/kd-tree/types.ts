export interface KDPoint {
  coordinates: number[]
}

export interface KDNode<T> {
  point: number[]
  value: T
  left: KDNode<T> | null
  right: KDNode<T> | null
  axis: number
}

export interface KDTreeOptions {
  dimensions: number
}

export const DEFAULT_KD_TREE_OPTIONS: KDTreeOptions = {
  dimensions: 2,
}
