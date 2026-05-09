export interface HAMTNode<K, V> {
  bitmap: number
  children: Array<HAMTNode<K, V>>
  isLeaf: boolean
  entries: Array<[K, V]>
}

export interface HAMTOptions {
  bitsPerLevel: number
}

export interface HAMTStats {
  size: number
  depth: number
  nodeCount: number
  leafCount: number
  collisionCount: number
}

export const DEFAULT_HAMT_OPTIONS: HAMTOptions = {
  bitsPerLevel: 5,
}
