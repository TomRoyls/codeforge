export interface CuckooSetOptions {
  capacity: number
  maxKicks: number
}

export const DEFAULT_CUCKOO_SET_OPTIONS: CuckooSetOptions = {
  capacity: 16,
  maxKicks: 500,
}

export interface CuckooStats {
  size: number
  capacity: number
  loadFactor: number
  maxChainLength: number
  table1Occupancy: number
  table2Occupancy: number
  resizeCount: number
}
