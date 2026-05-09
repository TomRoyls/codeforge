export interface LinkedHashMapEntry<K, V> {
  key: K
  value: V
  prev: LinkedHashMapEntry<K, V> | null
  next: LinkedHashMapEntry<K, V> | null
}

export interface LinkedHashMapOptions {
  initialCapacity: number
}

export const DEFAULT_LINKED_HASHMAP_OPTIONS: LinkedHashMapOptions = {
  initialCapacity: 16,
}
