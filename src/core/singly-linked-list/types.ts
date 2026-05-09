export interface SinglyLinkedListOptions<T> {
  initialValues?: T[]
  comparator?: (a: T, b: T) => number
}
