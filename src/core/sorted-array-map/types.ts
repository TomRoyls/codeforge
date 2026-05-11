export type Comparator<K> = (a: K, b: K) => number;

export interface SortedArrayMapOptions<K> {
  comparator?: Comparator<K>;
}

export interface Entry<K, V> {
  key: K;
  value: V;
}
