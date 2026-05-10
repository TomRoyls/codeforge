export interface SkipListQueueOptions {
  maxLevel?: number
  probability?: number
  comparator?: (a: number, b: number) => number
}

export interface SkipListQueueStatistics {
  enqueues: number
  dequeues: number
  removals: number
  updates: number
  maxLevel: number
  totalNodesCreated: number
}

export interface SkipListNode<T> {
  value: T
  priority: number
  forward: (SkipListNode<T> | null)[]
}

export const DEFAULT_SKIP_LIST_QUEUE_OPTIONS: Required<SkipListQueueOptions> = {
  maxLevel: 16,
  probability: 0.5,
  comparator: (a: number, b: number): number => a - b,
}
