export interface LFUCacheOptions<K, V> {
  maxSize: number
  onEvict?: (key: K, value: V) => void
}

export interface LFUCacheEntry<K, V> {
  key: K
  value: V
  frequency: number
}
