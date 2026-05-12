export type Comparator<T> = (a: T, b: T) => number

export interface MinMaxHeapOptions<T> {
  comparator?: Comparator<T>
}

export interface MinMaxHeapStats {
  size: number
  height: number
}
