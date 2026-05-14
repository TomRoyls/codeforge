export type CompareFn<T> = (a: T, b: T) => number

export const DEFAULT_COMPARE: CompareFn<unknown> = (a, b) => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
