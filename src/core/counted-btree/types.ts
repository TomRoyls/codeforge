export interface CountedBNode<T> {
  keys: number[]
  values: T[]
  children: CountedBNode<T>[]
  counts: number[]
}

export interface CountedBTreeOptions {
  order: number
}

export const DEFAULT_COUNTEDBTREE_OPTIONS: CountedBTreeOptions = {
  order: 5,
}
