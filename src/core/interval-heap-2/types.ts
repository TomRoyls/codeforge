export type Comparator<T> = (a: T, b: T) => number

export interface IntervalHeapOptions<T> {
  comparator?: Comparator<T>
}

export interface IntervalHeapStats {
  size: number
  nodeCount: number
  hasSingleElement: boolean
}
