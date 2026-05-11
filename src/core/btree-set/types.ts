export interface BTreeSetOptions<T> {
  order?: number
  comparator?: (a: T, b: T) => number
}
