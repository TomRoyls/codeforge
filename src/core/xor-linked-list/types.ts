export interface XORLinkedListOptions<T> {
  initialValues?: T[]
  comparator?: (a: T, b: T) => number
}

export interface XORNodeResult<T> {
  id: number
  value: T
}

export interface XORLinkedListStats {
  size: number
  memoryUsedBytes: number
  nodeIdRange: { min: number; max: number }
  uniqueValues: number
}
