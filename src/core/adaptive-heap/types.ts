export type Comparator<T> = (a: T, b: T) => number

export interface AdaptiveHeapOptions<T> {
  comparator?: Comparator<T>
}

export interface AdaptiveHeapStats {
  size: number
  height: number
  totalAccesses: number
}
