export interface CuckooMapOptions {
  capacity: number
  maxKicks: number
}

export const DEFAULT_CUCKOO_MAP_OPTIONS: CuckooMapOptions = {
  capacity: 16,
  maxKicks: 500,
}

export interface CuckooMapStats {
  size: number
  capacity: number
  loadFactor: number
  maxChainLength: number
  table1Occupancy: number
  table2Occupancy: number
  resizeCount: number
}
