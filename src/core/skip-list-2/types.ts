export interface SkipNode2<T> {
  key: number
  value: T
  prev: Array<SkipNode2<T> | null>
  next: Array<SkipNode2<T> | null>
  level: number
}

export interface SkipList2Options {
  maxLevel: number
  probability: number
}

export const DEFAULT_SKIPLIST2_OPTIONS: SkipList2Options = {
  maxLevel: 16,
  probability: 0.5,
}
