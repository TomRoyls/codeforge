export type HashFunction<T> = (value: T) => number

export type EqualityComparator<T> = (a: T, b: T) => boolean

export interface HashSetOptions<T> {
  hashFunction?: HashFunction<T>
  equals?: EqualityComparator<T>
  initialCapacity?: number
  loadFactor?: number
}

export interface HashSetStats {
  size: number
  capacity: number
  loadFactor: number
  buckets: number
  collisions: number
}
