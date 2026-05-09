export type Comparator<T> = (a: T, b: T) => number

export interface MultisetOptions<T> {
  readonly comparator: Comparator<T>
}

export interface MultisetStats<T> {
  readonly min: T | undefined
  readonly max: T | undefined
  readonly size: number
  readonly uniqueSize: number
  readonly minCount: number
  readonly maxCount: number
  readonly meanCount: number
}

export const DEFAULT_COMPARATOR: Comparator<string | number> = (a, b) =>
  a < b ? -1 : a > b ? 1 : 0
