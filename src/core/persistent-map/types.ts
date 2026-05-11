export type HashFunction<K> = (key: K) => number

export interface PersistentMapOptions<K> {
  hash?: HashFunction<K>
}
