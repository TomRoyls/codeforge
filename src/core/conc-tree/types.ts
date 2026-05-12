export interface ConcLeafNode<T> {
  kind: 'leaf'
  values: T[]
}

export interface ConcConcatNode<T> {
  kind: 'conc'
  left: ConcTreeNode<T>
  right: ConcTreeNode<T>
  size: number
  height: number
}

export type ConcTreeNode<T> = ConcLeafNode<T> | ConcConcatNode<T>
