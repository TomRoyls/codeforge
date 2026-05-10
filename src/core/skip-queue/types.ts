export interface SkipQueueNode<T> {
  item: T
  priority: number
  forward: (SkipQueueNode<T> | null)[]
}

export interface SkipQueueOptions<T> {
  maxLevel?: number
  probability?: number
  comparator?: (a: number, b: number) => number
  identity?: (item: T) => string | number
}

export interface SkipQueueStats {
  size: number
  maxLevel: number
  currentLevel: number
  probability: number
  nodeLevels: number[]
}
