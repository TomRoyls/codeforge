export interface DisjointSetOptions {
  initialCapacity?: number
}

export interface DisjointSetStats {
  elementCount: number
  componentCount: number
  maxComponentSize: number
  minComponentSize: number
  avgComponentSize: number
}
