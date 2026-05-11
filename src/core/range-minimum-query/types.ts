export interface RMQResult<T> {
  readonly value: T
  readonly index: number
}

export type RMQComparator<T> = (a: T, b: T) => number
