export interface OrderedMapEntry<K, V> {
  key: K
  value: V
  prev: OrderedMapEntry<K, V> | null
  next: OrderedMapEntry<K, V> | null
}

export interface OrderedMapOptions {
  initialCapacity: number
}

export interface OrderedMapStats {
  size: number
  isEmpty: boolean
  capacity: number
  loadFactor: number
}

export const DEFAULT_ORDEREDMAP_OPTIONS: OrderedMapOptions = {
  initialCapacity: 16,
}
