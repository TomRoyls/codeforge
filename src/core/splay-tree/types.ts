export interface SplayNode<T> {
  key: number
  value: T
  left: SplayNode<T> | null
  right: SplayNode<T> | null
  parent: SplayNode<T> | null
}

export interface SplayTreeOptions {
}

export const DEFAULT_SPLAYTREE_OPTIONS: SplayTreeOptions = {
}
