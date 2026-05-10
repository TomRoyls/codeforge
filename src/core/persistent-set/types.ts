export interface PersistentSetOptions<T> {
  comparator?: (a: T, b: T) => number
}

export interface PersistentSetStats {
  size: number
  height: number
}
