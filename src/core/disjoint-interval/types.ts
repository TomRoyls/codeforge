export type Interval = [number, number]

export interface IntervalOptions {
  comparator?: (a: number, b: number) => number
}

export const DEFAULT_COMPARATOR = (a: number, b: number): number => {
  if (a === b) return 0
  return a < b ? -1 : 1
}
