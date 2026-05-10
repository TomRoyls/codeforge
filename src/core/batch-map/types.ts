export interface BatchMapOptions {
  initialCapacity: number
  loadFactor: number
}

export interface BatchMapStatistics {
  sets: number
  gets: number
  deletes: number
  batchSets: number
  batchGets: number
  batchDeletes: number
  totalItemsProcessed: number
}

export const DEFAULT_BATCH_MAP_OPTIONS: BatchMapOptions = {
  initialCapacity: 64,
  loadFactor: 0.75,
}
