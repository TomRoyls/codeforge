export interface DoublyLinkedListOptions<T> {
  initialValues?: T[]
  comparator?: (a: T, b: T) => number
}
