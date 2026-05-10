export type Comparator<T> = (a: T, b: T) => number

export interface SortedSetOptions<T> {
  readonly comparator?: Comparator<T>
}

export interface SortedSetStats {
  readonly size: number
  readonly min: unknown
  readonly max: unknown
}

export const DEFAULT_COMPARATOR: Comparator<string | number> = (a, b) =>
  a < b ? -1 : a > b ? 1 : 0
