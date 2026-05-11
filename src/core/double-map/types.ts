export type { DoubleMap } from './index.js'

export type DoubleMapOptions<K1, K2> = {
  key1Hash?: (key: K1) => string
  key2Hash?: (key: K2) => string
}

export type DoubleMapEntry<K1, K2, V> = {
  k1: K1
  k2: K2
  v: V
}

export type DoubleMapForEachCallback<K1, K2, V> = (
  k1: K1,
  k2: K2,
  v: V,
) => void
