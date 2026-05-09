export interface CountMinSketchOptions {
  width: number
  depth: number
}

export interface CountMinSketchJSON {
  matrix: number[][]
  width: number
  depth: number
  totalCount: number
}

export const DEFAULT_COUNTMINSKETCH_OPTIONS: CountMinSketchOptions = {
  width: 1000,
  depth: 5,
}
