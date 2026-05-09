export type CuckooHashMapOptions = {
  capacity?: number
  maxKicks?: number
}

export type CuckooHashMapStats = {
  size: number
  capacity: number
  loadFactor: number
  maxKicksUsed: number
}

type CuckooEntry<K, V> = {
  key: K
  value: V
}

export type { CuckooEntry }
