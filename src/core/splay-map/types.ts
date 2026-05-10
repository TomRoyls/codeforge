export interface SplayMapOptions<K = unknown> {
  comparator?: (a: K, b: K) => number
}

export interface SplayMapStatistics {
  sets: number
  gets: number
  deletes: number
  splayOperations: number
  rotations: number
  maxDepth: number
}

export interface SplayMapNodeJSON<K, V> {
  key: K
  value: V
  left: SplayMapNodeJSON<K, V> | null
  right: SplayMapNodeJSON<K, V> | null
}

export interface SplayMapJSON<K, V> {
  root: SplayMapNodeJSON<K, V> | null
  size: number
  statistics: SplayMapStatistics
}

export const DEFAULT_SPLAY_MAP_OPTIONS: Required<SplayMapOptions> = {
  comparator: (a: unknown, b: unknown): number => {
    if (a === b) return 0
    return (a as number) < (b as number) ? -1 : 1
  },
}
