export interface Point {
  x: number
  y: number
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

export interface QuadTreeOptions {
  maxPoints: number
  maxDepth: number
}

export const DEFAULT_QUAD_TREE_OPTIONS: QuadTreeOptions = {
  maxPoints: 4,
  maxDepth: 8,
}
