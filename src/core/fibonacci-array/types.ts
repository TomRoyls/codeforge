export interface FibonacciArrayOptions {
  initialCapacity: number
}

export interface FibonacciArrayStats {
  length: number
  capacity: number
  bucketCount: number
  utilizationRatio: number
}

export const DEFAULT_FIBONACCI_ARRAY_OPTIONS: FibonacciArrayOptions = {
  initialCapacity: 8,
}
