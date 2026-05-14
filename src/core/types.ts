export type CompareFn<T> = (a: T, b: T) => number

export const DEFAULT_COMPARE: CompareFn<unknown> = (a, b) => {
  if (String(a) < String(b)) return -1
  if (String(a) > String(b)) return 1
  return 0
}
