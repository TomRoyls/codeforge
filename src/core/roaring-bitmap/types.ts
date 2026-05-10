export interface RoaringBitmapOptions {
  runOptimizeOnAdd?: boolean
  runOptimizeThreshold?: number
  initialCapacity?: number
}

export interface RoaringBitmapStatistics {
  adds: number
  removes: number
  setOperations: number
  containerConversions: number
  estimatedBytes: number
}

export interface RoaringBitmapJSON {
  containers: Array<{
    key: number
    type: 'array' | 'bitmap' | 'run'
    data: number[] | { start: number; length: number }[]
  }>
  statistics: RoaringBitmapStatistics
}

export const DEFAULT_ROARING_BITMAP_OPTIONS: Required<RoaringBitmapOptions> = {
  runOptimizeOnAdd: false,
  runOptimizeThreshold: 4,
  initialCapacity: 0,
}
