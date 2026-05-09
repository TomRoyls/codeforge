export interface CuckooFilterOptions {
  capacity: number
  bucketSize: number
  fingerprintSize: number
  maxKicks: number
}

export const DEFAULT_CUCKOO_FILTER_OPTIONS: CuckooFilterOptions = {
  capacity: 1024,
  bucketSize: 4,
  fingerprintSize: 8,
  maxKicks: 500,
}
