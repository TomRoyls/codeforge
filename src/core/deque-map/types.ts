export interface DequeMapEntry<K, V> {
  key: K
  value: V
  prev: DequeMapEntry<K, V> | null
  next: DequeMapEntry<K, V> | null
}

export interface DequeMapStats {
  size: number
  isEmpty: boolean
}

export const DEFAULT_DEQUEMAP_OPTIONS: Record<string, never> = {}
