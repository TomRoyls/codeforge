export type { HashMap2 } from './index.js'

export type HashMap2Options<K> = {
  initialCapacity?: number
  loadFactor?: number
  hash?: (key: K) => number
}

export type ForEachCallback<K, V> = (value: V, key: K) => void

export type MapPredicate<K, V> = (value: V, key: K) => boolean

export type MapValueTransform<K, V, U> = (value: V, key: K) => U
