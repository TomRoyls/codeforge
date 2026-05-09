export type EntryState = 'occupied' | 'deleted' | 'empty'

export interface HashEntry<K, V> {
  key: K
  value: V
  state: EntryState
}
