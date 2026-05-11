export type Comparator<T> = (a: T, b: T) => number;

export interface PrioritySearchTreeOptions<K, P> {
  priorityComparator?: Comparator<P>;
  keyComparator?: Comparator<K>;
}

export interface PriorityEntry<K, P> {
  key: K;
  priority: P;
}
