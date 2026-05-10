export interface StaticSparseSetOptions {
  readonly universeSize?: number
}

export interface StaticSparseSetStatistics {
  readonly inserts: number
  readonly deletes: number
  readonly lookups: number
  readonly iterations: number
  readonly denseArrayMoves: number
}

export const DEFAULT_STATIC_SPARSE_SET_OPTIONS: Required<StaticSparseSetOptions> = {
  universeSize: 256,
}
