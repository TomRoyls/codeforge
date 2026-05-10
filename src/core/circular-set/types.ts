export interface CircularSetOptions {
  capacity: number
}

export interface CircularSetStats {
  capacity: number
  size: number
  isEmpty: boolean
  isFull: boolean
  utilization: number
  totalAdded: number
  totalEvicted: number
  totalDeleted: number
}

export const DEFAULT_CIRCULAR_SET_OPTIONS: CircularSetOptions = {
  capacity: 64,
}
