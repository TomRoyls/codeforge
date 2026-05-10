export interface SpatialHashOptions {
  cellSize?: number
}

export interface SpatialHashEntry<T = unknown> {
  id: string | number
  x: number
  y: number
  data?: T
}

export interface SpatialHashStatistics {
  inserts: number
  removes: number
  updates: number
  queries: number
  cellCount: number
  maxEntriesPerCell: number
}

export interface SpatialHashBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface SpatialHashJSON<T = unknown> {
  cellSize: number
  entries: Array<{ id: string | number; x: number; y: number; data?: T }>
  statistics: SpatialHashStatistics
}

export const DEFAULT_SPATIAL_HASH_OPTIONS: Required<SpatialHashOptions> = {
  cellSize: 64,
}
