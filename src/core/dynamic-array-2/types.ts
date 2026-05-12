export type GrowthStrategy = 'geometric' | 'fixed' | 'linear' | 'fibonacci'

export type EqualityComparator<T> = (a: T, b: T) => boolean

export interface DynamicArrayOptions<T> {
  initialCapacity?: number
  growthFactor?: number
  growthStrategy?: GrowthStrategy
  equals?: EqualityComparator<T>
}
