export interface SortedLinkedListOptions<T> {
  comparator?: (a: T, b: T) => number;
}
