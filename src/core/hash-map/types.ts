export interface HashMapEntry<K, V> {
  key: K
  value: V
  next: HashMapEntry<K, V> | null
}

export interface HashMapOptions {
  initialCapacity: number
  loadFactor: number
}

export const DEFAULT_HASHMAP_OPTIONS: HashMapOptions = {
  initialCapacity: 16,
  loadFactor: 0.75,
}
