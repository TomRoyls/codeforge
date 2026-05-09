export interface DequeNode<T> {
  value: T
  prev: DequeNode<T> | null
  next: DequeNode<T> | null
}

export interface DequeOptions {
  maxSize: number
}

export const DEFAULT_DEQUE_OPTIONS: DequeOptions = {
  maxSize: 0,
}
