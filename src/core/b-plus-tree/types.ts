export interface BPlusNode<T> {
  keys: number[]
  children: BPlusNode<T>[]
  values: Map<number, T[]>
  isLeaf: boolean
  next: BPlusNode<T> | null
}

export interface BPlusTreeOptions {
  order: number
}

export const DEFAULT_BPLUSTREE_OPTIONS: BPlusTreeOptions = {
  order: 3,
}
