export interface Interval {
  start: number
  end: number
}

export interface IntervalEntry<T> {
  interval: Interval
  value: T
}

export interface IntervalNode<T> {
  interval: Interval
  value: T
  max: number
  left: IntervalNode<T> | null
  right: IntervalNode<T> | null
}

export interface IntervalTreeStats {
  nodeCount: number
  height: number
  maxRange: number
}
