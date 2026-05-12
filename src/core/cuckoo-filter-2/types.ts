export interface CuckooFilterOptions {
  capacity?: number
  bucketSize?: number
  maxKicks?: number
}

export interface CuckooFilterStats {
  size: number
  capacity: number
  bucketSize: number
  maxKicks: number
  loadFactor: number
}
