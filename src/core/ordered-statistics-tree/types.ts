export type CompareFunction<T> = (a: T, b: T) => number

export interface OrderedStatisticsTreeOptions<T> {
  comparator?: CompareFunction<T>
}

export interface OSTNode<T> {
  key: T
  left: OSTNode<T> | null
  right: OSTNode<T> | null
  height: number
  size: number
}

export interface RangeIteratorResult<T> {
  value: T
  done: boolean
}
