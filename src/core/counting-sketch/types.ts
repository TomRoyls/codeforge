export interface CountingSketchOptions {
  width?: number
  depth?: number
  hashFunctions?: number
}

export interface CountingSketchStatistics {
  updates: number
  queries: number
  merges: number
  totalItemCount: number
}

export interface CountingSketchJSON {
  table: number[][]
  width: number
  depth: number
  hashFunctions: number
  statistics: CountingSketchStatistics
}

export const DEFAULT_COUNTING_SKETCH_OPTIONS: Required<CountingSketchOptions> = {
  width: 1000,
  depth: 5,
  hashFunctions: 5,
}
