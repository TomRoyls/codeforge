export interface PSTNode<T> {
  value: T
  left: PSTNode<T> | null
  right: PSTNode<T> | null
}

export interface PersistentSegmentTreeOptions<T> {
  size: number
  operation: (a: T, b: T) => T
  identity: T
  initialValues?: T[]
}
