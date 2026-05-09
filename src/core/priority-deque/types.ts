export type CompareFn<T> = (a: T, b: T) => number

export interface PriorityDequeOptions<T> {
  compare: CompareFn<T>
}

export const DEFAULT_COMPARE: CompareFn<number> = (a, b) => a - b
