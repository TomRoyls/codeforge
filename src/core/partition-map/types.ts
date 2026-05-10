export interface PartitionMapOptions<T, K> {
  partitionKey: (item: T) => K
  capacity?: number
}

export interface PartitionMapStats {
  partitionCount: number
  totalItems: number
  isEmpty: boolean
  avgItemsPerPartition: number
  maxItemsPerPartition: number
  minItemsPerPartition: number
  capacity: number | null
}
