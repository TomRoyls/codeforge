export interface Run {
  start: number
  length: number
}

export interface SparseBitmapOptions {
  initialCapacity?: number
}

export interface SparseBitmapStats {
  runCount: number
  setBitCount: number
  memoryUsageBytes: number
  compressionRatio: number
  isEmpty: boolean
  minBit: number | null
  maxBit: number | null
}

export interface SparseBitmapData {
  runs: Run[]
}
