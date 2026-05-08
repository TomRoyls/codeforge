export interface SkipNode<T> {
  key: number
  value: T
  forward: (SkipNode<T> | null)[]
}

export interface SkipListOptions {
  maxLevel: number
  probability: number
}

export interface SkipListStats {
  size: number
  maxLevel: number
  currentLevel: number
  nodeCount: number
}

export const DEFAULT_SKIP_LIST_OPTIONS: SkipListOptions = {
  maxLevel: 16,
  probability: 0.5,
}
