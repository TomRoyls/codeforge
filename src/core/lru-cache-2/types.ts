export interface LRU2CacheOptions {
  maxSize?: number
}

export interface LRU2Entry<V> {
  value: V
  accessTimes: number[]
}
