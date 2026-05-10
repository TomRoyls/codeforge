export type CollisionMapOptions = {
  bucketCount?: number
  hashFn?: (key: string) => number
}

export type CollisionEntry<V> = {
  key: string
  value: V | undefined
  hash: number
}
