export interface IndexedSetNode<T> {
  value: T
  priority: number
  left: IndexedSetNode<T> | null
  right: IndexedSetNode<T> | null
  size: number
}

export type IndexedSetComparator<T> = (a: T, b: T) => number

export interface IndexedSetOptions<T> {
  readonly comparator?: IndexedSetComparator<T>
}

export interface IndexedSetStats {
  readonly size: number
  readonly height: number
  readonly minValue: unknown
  readonly maxValue: unknown
}

export const DEFAULT_INDEXED_SET_COMPARATOR: IndexedSetComparator<string | number> = (a, b) =>
  a < b ? -1 : a > b ? 1 : 0
