export interface ObjectPoolOptions<T> {
  reset?: (obj: T) => void
  initialSize?: number
  maxCapacity?: number
}

export interface ObjectPoolStats {
  size: number
  allocated: number
  inUse: number
  isEmpty: boolean
  isFull: boolean
  maxCapacity: number | undefined
}
