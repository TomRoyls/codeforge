export interface BoundedStackOptions {
  capacity: number
}

export interface BoundedStackStats {
  capacity: number
  size: number
  isEmpty: boolean
  isFull: boolean
  totalPushed: number
  totalPopped: number
  totalEvicted: number
  utilization: number
}

export const DEFAULT_BOUNDED_STACK_OPTIONS: BoundedStackOptions = {
  capacity: 64,
}
