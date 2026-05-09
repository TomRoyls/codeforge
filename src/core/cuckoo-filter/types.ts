export interface CuckooFilterOptions {
  capacity: number
  bucketSize: number
  maxKicks: number
  fingerprintSize: number
}

export const DEFAULT_CUCKOOFILTER_OPTIONS: CuckooFilterOptions = {
  capacity: 1024,
  bucketSize: 4,
  maxKicks: 500,
  fingerprintSize: 8,
}
