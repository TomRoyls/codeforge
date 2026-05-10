export interface BoundedPriorityQueueOptions<T> {
  comparator?: (a: T, b: T) => number
}
