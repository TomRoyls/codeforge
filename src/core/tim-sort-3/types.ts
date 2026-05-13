export type CompareFn<T> = (a: T, b: T) => number

export interface RunInfo {
  start: number
  length: number
}
