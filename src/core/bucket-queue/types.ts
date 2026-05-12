export interface BucketQueueOptions {
  maxPriority?: number
}

export interface BucketQueueEntry<T> {
  value: T
  priority: number
}

export interface BucketQueueStats {
  size: number
  bucketCount: number
  minPriority: number | undefined
  maxPriority: number | undefined
}
