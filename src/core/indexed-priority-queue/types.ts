export type Comparator<T> = (a: T, b: T) => number

export interface IndexedPriorityQueueOptions<T> {
  comparator?: Comparator<T>
}

export interface IndexedPriorityQueueEntry<T> {
  index: number
  priority: T
}

export interface IndexedPriorityQueueStats {
  size: number
  height: number
}
