export type KDPoint = number[]

export interface KDRect {
  min: KDPoint
  max: KDPoint
}

export interface KDTreeOptions {
  dimensions?: number
}

export interface KDTreeNode {
  point: KDPoint
  left: KDTreeNode | null
  right: KDTreeNode | null
}
