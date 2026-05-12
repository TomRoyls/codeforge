export type Comparator<T> = (a: T, b: T) => number

export interface DAryHeapOptions<T> {
  d?: number
  comparator?: Comparator<T>
}

export interface DAryHeapStats {
  size: number
  height: number
  d: number
}
