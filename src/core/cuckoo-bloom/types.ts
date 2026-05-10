export interface CuckooBloomOptions {
  capacity: number
  fingerprintSize: number
  bucketSize: number
  maxKicks: number
}

export const DEFAULT_CUCKOO_BLOOM_OPTIONS: CuckooBloomOptions = {
  capacity: 1024,
  fingerprintSize: 8,
  bucketSize: 4,
  maxKicks: 500,
}
