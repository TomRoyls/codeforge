export type Comparator<T> = (a: T, b: T) => number

export interface IntervalHeapOptions<T> {
  comparator?: Comparator<T>
}

export interface IntervalNode<T> {
  min: T
  max: T | null
}
