export interface LinkedHashSetNode<T> {
  value: T
  prev: LinkedHashSetNode<T> | null
  next: LinkedHashSetNode<T> | null
}

export interface LinkedHashSetOptions {
  readonly initialCapacity?: number
}

export interface LinkedHashSetStats {
  readonly size: number
  readonly capacity: number
}

export const DEFAULT_LINKED_HASH_SET_OPTIONS: LinkedHashSetOptions = {
  initialCapacity: 16,
}
