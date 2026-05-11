export type Comparator<K> = (a: K, b: K) => number;

export interface BPlusTreeOptions<K> {
  order?: number;
  comparator?: Comparator<K>;
}

export interface Entry<K, V> {
  key: K;
  value: V;
}
