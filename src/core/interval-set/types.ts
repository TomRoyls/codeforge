export interface Interval {
  readonly start: number
  readonly end: number
}

export interface IntervalSetStats {
  intervalCount: number
  totalCovered: number
  min: number | undefined
  max: number | undefined
  largestInterval: [number, number] | undefined
  smallestInterval: [number, number] | undefined
  averageIntervalSize: number
}
