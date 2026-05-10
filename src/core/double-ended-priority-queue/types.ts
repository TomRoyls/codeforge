export type Comparator<T> = (a: T, b: T) => number

export interface DoubleEndedPriorityQueueOptions<T> {
  comparator: Comparator<T>
  initialCapacity: number
}

export const DEFAULT_COMPARATOR: Comparator<number> = (a, b) => a - b

export const DEFAULT_STRING_COMPARATOR: Comparator<string> = (a, b) =>
  a < b ? -1 : a > b ? 1 : 0

export const DEFAULT_DEPQ_OPTIONS: DoubleEndedPriorityQueueOptions<never> = {
  comparator: DEFAULT_COMPARATOR as Comparator<never>,
  initialCapacity: 16,
}
