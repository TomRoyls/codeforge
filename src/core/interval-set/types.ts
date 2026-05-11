export interface Interval<T> {
  start: T
  end: T
}

export type Comparator<T> = (a: T, b: T) => number

export type DistanceFn<T> = (a: T, b: T) => number

export interface IntervalSetOptions<T> {
  compare?: Comparator<T>
  distance?: DistanceFn<T>
}
