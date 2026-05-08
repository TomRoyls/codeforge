export interface MatrixEntry {
  row: number
  col: number
  value: number
}

export interface MatrixDimensions {
  rows: number
  cols: number
}

export interface SparseMatrixOptions {
  rows: number
  cols: number
  defaultValue: number
}

export interface MatrixStats {
  rows: number
  cols: number
  nonZeroCount: number
  density: number
  fillFactor: number
}

export const DEFAULT_SPARSE_MATRIX_OPTIONS: SparseMatrixOptions = {
  rows: 0,
  cols: 0,
  defaultValue: 0,
}
