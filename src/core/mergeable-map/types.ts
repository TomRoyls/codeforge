export type ConflictResolver<K, V> = (
  key: K,
  currentValue: V,
  otherValue: V,
) => V

export interface MergeResult {
  added: number
  updated: number
  removed: number
  unchanged: number
}

export interface MergeableMapEntry<K, V> {
  key: K
  value: V
}

export interface MapDifference<K, V> {
  leftOnly: Array<MergeableMapEntry<K, V>>
  rightOnly: Array<MergeableMapEntry<K, V>>
  common: Array<MergeableMapEntry<K, V>>
  changed: Array<{ key: K; leftValue: V; rightValue: V }>
}
