export interface NeighborMapOptions {
  gridSize?: number
}

export interface NeighborMapStatistics {
  inserts: number
  removes: number
  nearestQueries: number
  radiusQueries: number
  avgQuerySize: number
}

export const DEFAULT_NEIGHBOR_MAP_OPTIONS: Required<NeighborMapOptions> = {
  gridSize: 10,
}
