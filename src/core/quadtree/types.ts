export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface QuadTreePoint<T = undefined> {
  x: number
  y: number
  value?: T
}

export interface QuadTreeOptions<T = undefined> {
  bounds: Rect
  capacity?: number
  _type?: T
}

export interface QuadTreeStats {
  size: number
  depth: number
  nodeCount: number
  bounds: Rect
}

export const DEFAULT_CAPACITY = 4
