export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

export interface RTreeOptions {
  maxEntries: number
  minEntries: number
}

export const DEFAULT_RTREE_OPTIONS: RTreeOptions = {
  maxEntries: 9,
  minEntries: 4,
}
