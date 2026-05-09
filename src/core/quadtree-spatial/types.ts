export interface Point {
  x: number
  y: number
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface QuadTreeSpatialOptions {
  bounds: BoundingBox
  capacity: number
  maxDepth: number
}

export const DEFAULT_QUADTREE_SPATIAL_OPTIONS: QuadTreeSpatialOptions = {
  bounds: { x: 0, y: 0, width: 100, height: 100 },
  capacity: 4,
  maxDepth: 8,
}
