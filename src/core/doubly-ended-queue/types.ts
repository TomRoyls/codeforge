export interface DoublyLinkedNode<T> {
  value: T
  prev: DoublyLinkedNode<T> | null
  next: DoublyLinkedNode<T> | null
}
