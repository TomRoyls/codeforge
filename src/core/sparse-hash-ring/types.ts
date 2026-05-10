export type SparseHashFunction = (key: string) => number

export interface SparseHashRingOptions {
  virtualNodesPerUnit?: number
  hashFunction?: SparseHashFunction
}

export interface SparseHashRingStatistics {
  adds: number
  removes: number
  lookups: number
  rebalances: number
  virtualNodes: number
  totalWeight: number
}

export interface SparseRingEntry<T extends string> {
  hash: number
  node: T
}

export const DEFAULT_SPARSE_HASH_RING_OPTIONS: Required<SparseHashRingOptions> = {
  virtualNodesPerUnit: 100,
  hashFunction: (key: string): number => {
    let h = 2166136261
    for (let i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  },
}
