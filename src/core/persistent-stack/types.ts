export interface StackNode<T> {
  readonly value: T
  readonly next: StackNode<T> | null
}

export type ElementComparator<T> = (a: T, b: T) => boolean
