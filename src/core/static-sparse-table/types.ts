export type QueryMode = "min" | "max" | "gcd" | "sum"

export interface StaticSparseTableOptions<T> {
  data: T[]
  comparator?: (a: T, b: T) => number
}

export interface StaticSparseTableStats {
  size: number
  memoryBytes: number
  tableLevels: number
  queryMode: string
}

export const DEFAULT_COMPARATOR = <T>(a: T, b: T): number =>
  a < b ? -1 : a > b ? 1 : 0
