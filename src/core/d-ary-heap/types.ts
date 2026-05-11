export interface DAryHeapOptions<T> {
  arity?: number
  comparator?: (a: T, b: T) => number
}
