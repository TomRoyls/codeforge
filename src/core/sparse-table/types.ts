export interface SparseTableOptions<T> {
  values: T[]
  operation: (a: T, b: T) => T
  isIdempotent?: boolean
}
