export interface AVLMultisetOptions<T = number> {
  comparator?: (a: T, b: T) => number
}

export interface AVLMultisetStatistics {
  adds: number
  removes: number
  rotations: number
  maxDepth: number
  uniqueCount: number
}

export interface AVLMultisetNodeJSON<T> {
  value: T
  count: number
  height: number
  left: AVLMultisetNodeJSON<T> | null
  right: AVLMultisetNodeJSON<T> | null
}

export interface AVLMultisetJSON<T> {
  root: AVLMultisetNodeJSON<T> | null
  size: number
  uniqueSize: number
  statistics: AVLMultisetStatistics
}

export const DEFAULT_AVL_MULTISET_OPTIONS: Required<AVLMultisetOptions> = {
  comparator: (a, b): number => {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  },
}
