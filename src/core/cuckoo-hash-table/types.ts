export interface CuckooHashTableOptions {
  capacity: number
  maxEvictions: number
  numTables: number
}

export const DEFAULT_CUCKOO_OPTIONS: CuckooHashTableOptions = {
  capacity: 16,
  maxEvictions: 50,
  numTables: 2,
}

export interface CuckooHashTableStatistics {
  insertions: number
  evictions: number
  resizes: number
  lookups: number
  deletions: number
}

export interface CuckooEntry<K, V> {
  key: K
  value: V
}
