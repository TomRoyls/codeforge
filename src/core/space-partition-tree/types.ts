export interface SpacePartitionTreeOptions {
  minX: number
  minY: number
  maxX: number
  maxY: number
  maxDepth?: number
  maxItems?: number
}

export interface SpatialItem<T = unknown> {
  x: number
  y: number
  data: T
}

export interface SpaceNode<T = unknown> {
  minX: number
  minY: number
  maxX: number
  maxY: number
  items: SpatialItem<T>[]
  children: SpaceNode<T>[] | null
  depth: number
}

export const DEFAULT_MAX_DEPTH = 8
export const DEFAULT_MAX_ITEMS = 4
