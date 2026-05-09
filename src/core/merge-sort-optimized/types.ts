export type CompareFn<T> = (a: T, b: T) => number

export interface SortResult<T> {
  sorted: T[]
  inversions: number
}

export interface RunInfo {
  start: number
  length: number
  ascending: boolean
}
