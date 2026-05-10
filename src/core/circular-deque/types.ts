export interface CircularDequeOptions {
  initialCapacity: number
}

export interface CircularDequeStats {
  capacity: number
  size: number
  isEmpty: boolean
  isFull: boolean
  utilization: number
}

export const DEFAULT_CIRCULAR_DEQUE_OPTIONS: CircularDequeOptions = {
  initialCapacity: 16,
}
