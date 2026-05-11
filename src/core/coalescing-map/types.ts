export type { CoalescingMap } from './index.js'

export type CoalescingMapOptions<K> = {
  compare?: (a: K, b: K) => number
  predecessor?: (k: K) => K
  successor?: (k: K) => K
}

export type CoalescingMapRange<K, V> = {
  start: K
  end: K
  value: V
}

export type CoalescingMapForEachCallback<K, V> = (
  start: K,
  end: K,
  value: V,
) => void
