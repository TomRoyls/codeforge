export interface QuadTreeMapOptions {
  capacity?: number;
  maxDepth?: number;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Point {
  x: number;
  y: number;
}

export interface QuadTreeEntry<V> {
  x: number;
  y: number;
  value: V;
}

export interface QuadTreeMapStatistics {
  inserts: number;
  deletes: number;
  queries: number;
  subdivisions: number;
  maxDepth: number;
}

export const DEFAULT_QUAD_TREE_MAP_OPTIONS: Required<QuadTreeMapOptions> = {
  capacity: 4,
  maxDepth: 8,
  bounds: { x: 0, y: 0, width: 1000, height: 1000 },
};
