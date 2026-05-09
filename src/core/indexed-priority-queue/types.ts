export interface IndexedPriorityQueueOptions {
  capacity?: number
  comparator?: (a: number, b: number) => number
}

export interface QueueEntry {
  index: number
  priority: number
}

export const DEFAULT_COMPARATOR = (a: number, b: number): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
