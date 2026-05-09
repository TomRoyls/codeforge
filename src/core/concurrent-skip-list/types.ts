export interface SkipNode<K, V> {
  key: K
  value: V
  forward: (SkipNode<K, V> | null)[]
  span: number[]
}

export interface ConcurrentSkipListOptions<K> {
  maxLevel?: number
  probability?: number
  comparator?: (a: K, b: K) => number
}

export interface ConcurrentSkipListStats {
  size: number
  height: number
  maxLevel: number
  probability: number
  nodeCount: number
  levelDistribution: number[]
}

export const DEFAULT_PROBABILITY = 0.5
export const DEFAULT_MAX_LEVEL = 16

export const DEFAULT_COMPARATOR = <K>(a: K, b: K): number =>
  a < b ? -1 : a > b ? 1 : 0
