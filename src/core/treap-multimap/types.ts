export interface TreapMultimapOptions<K> {
  comparator?: (a: K, b: K) => number
  priorityGenerator?: () => number
}

export interface TreapMultimapStatistics {
  sets: number
  deletes: number
  rotations: number
  maxDepth: number
  totalValues: number
}

export interface TreapMultimapJSON<K, V> {
  nodes: Array<{ key: K; values: V[]; priority: number }>
  statistics: TreapMultimapStatistics
}

export const DEFAULT_TREAP_MULTIMAP_OPTIONS: Required<TreapMultimapOptions<never>> = {
  comparator: (a, b): number => {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  },
  priorityGenerator: () => Math.random(),
}
