export interface ScapegoatNode<K, V> {
  key: K
  value: V
  left: ScapegoatNode<K, V> | null
  right: ScapegoatNode<K, V> | null
}

export type CompareFunction<K> = (a: K, b: K) => number

export interface ScapegoatTreeMapOptions<K> {
  compare?: CompareFunction<K>
  alpha?: number
}

export interface ScapegoatTreeMapStats {
  size: number
  height: number
  alpha: number
  maxSize: number
  rebalanceCount: number
  rebuildCount: number
}
