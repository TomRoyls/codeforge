export interface MinMaxDequeOptions<T = unknown> {
  comparator?: (a: T, b: T) => number
}
