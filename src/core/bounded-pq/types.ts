export type Comparator<T> = (a: T, b: T) => number

export interface BoundedPriorityQueueOptions<T> {
  comparator?: Comparator<T>
}
