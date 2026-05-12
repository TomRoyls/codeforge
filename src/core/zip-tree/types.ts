export interface ZipTreeOptions<K, _V = unknown> {
  comparator?: (a: K, b: K) => number;
}
