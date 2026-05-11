export const BLOCK_SIZE = 32
export const MAX_HEIGHT_DIFF = 3

export type ConcTreeNode<T> =
  | { readonly tag: 'leaf'; readonly values: readonly T[] }
  | { readonly tag: 'node'; readonly left: ConcTreeNode<T>; readonly right: ConcTreeNode<T>; readonly size: number; readonly height: number }

export interface ConcTreeStats {
  size: number
  height: number
  leafCount: number
  nodeCount: number
}
