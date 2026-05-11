export interface Point2D {
  x: number
  y: number
}

export interface Rect2D {
  x: number
  y: number
  width: number
  height: number
}

export interface QuadTree2Options {
  bounds: Rect2D
  capacity: number
  maxDepth: number
}

export const DEFAULT_QUADTREE2_OPTIONS: QuadTree2Options = {
  bounds: { x: 0, y: 0, width: 1000, height: 1000 },
  capacity: 4,
  maxDepth: 8,
}
