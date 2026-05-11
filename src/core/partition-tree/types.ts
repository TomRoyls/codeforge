export interface PartitionPoint<T = undefined> {
  x: number
  y: number
  data?: T
}

export interface Rectangle {
  minX: number
  maxX: number
  minY: number
  maxY: number
}
