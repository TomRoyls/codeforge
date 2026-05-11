export interface CuckooEntry<K, V> {
  key: K
  value: V
}

export type HashFunction<K> = (key: K, tableSize: number) => number

export interface CuckooHashOptions<K> {
  initialCapacity?: number
  maxLoadFactor?: number
  maxKicks?: number
  hash1?: HashFunction<K>
  hash2?: HashFunction<K>
}
