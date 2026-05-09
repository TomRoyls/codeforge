export type CompareFn<T> = (a: T, b: T) => number

export const DEFAULT_COMPARE: CompareFn<unknown> = (a, b) => {
  const x = a as number | string
  const y = b as number | string
  if (x < y) return -1
  if (x > y) return 1
  return 0
}
