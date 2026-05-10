export interface CountingCuckooFilterOptions {
  capacity: number
  bucketSize: number
  fingerprintSize: number
  maxKicks: number
}

export interface CountingCuckooFilterStatistics {
  inserts: number
  deletes: number
  lookups: number
  relocations: number
  maxRelocations: number
  countQueries: number
  falsePositives: number
}

export const DEFAULT_COUNTING_CUCKOO_FILTER_OPTIONS: CountingCuckooFilterOptions = {
  capacity: 1024,
  bucketSize: 4,
  fingerprintSize: 8,
  maxKicks: 500,
}
