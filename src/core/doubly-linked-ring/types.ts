export interface DoublyLinkedRingNode<T> {
  value: T
  prev: DoublyLinkedRingNode<T> | null
  next: DoublyLinkedRingNode<T> | null
}

export interface DoublyLinkedRingOptions {
  circular?: boolean
}

export interface DoublyLinkedRingStatistics {
  insertions: number
  deletions: number
  rotations: number
}
