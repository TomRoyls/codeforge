export interface DisjointMapNode<K, V> {
  key: K
  rank: number
  parent: K
  value: V
}

export interface DisjointMapOptions<V> {
  merge: (a: V, b: V) => V
}

export interface DisjointMapStats {
  elementCount: number
  componentCount: number
  maxComponentSize: number
  minComponentSize: number
}

export const DEFAULT_DISJOINT_MAP_OPTIONS = {
  merge: <T>(a: T, _b: T): T => a,
}
