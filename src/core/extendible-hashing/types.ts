export type HashFunction<K> = (key: K) => number

export interface ExtendibleHashingOptions<K> {
  hashFunction?: HashFunction<K>
  bucketSize?: number
}

export interface BucketEntry<K, V> {
  key: K
  value: V
}

export interface Bucket<K, V> {
  localDepth: number
  entries: BucketEntry<K, V>[]
}

export interface ExtendibleHashingStats {
  globalDepth: number
  bucketCount: number
  totalEntries: number
  directorySize: number
}
