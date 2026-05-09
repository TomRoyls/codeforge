export type Point2D = [number, number]

export interface RangeTreeNode {
  x: number
  points: Point2D[]
  left: RangeTreeNode | null
  right: RangeTreeNode | null
  sortedY: number[]
  sortedYPoints: Point2D[]
}

export interface RangeTreeOptions {
  allowDuplicates: boolean
}

export const DEFAULT_RANGE_TREE_OPTIONS: RangeTreeOptions = {
  allowDuplicates: true,
}
