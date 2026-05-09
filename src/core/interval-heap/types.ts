export interface IntervalHeapOptions<T> {
  initialValues?: T[]
  comparator?: (a: T, b: T) => number
}
