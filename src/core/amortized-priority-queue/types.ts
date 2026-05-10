export interface AmortizedPriorityQueueOptions<T> {
  comparator?: (a: T, b: T) => number
  bufferSize?: number
}
