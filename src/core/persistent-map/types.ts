export interface PersistentMapOptions<K> {
  comparator?: (a: K, b: K) => number
}

export interface PersistentMapStats {
  size: number
  height: number
}
