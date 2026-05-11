export interface ThreadedTreeOptions<T> {
  comparator?: (a: T, b: T) => number
}
