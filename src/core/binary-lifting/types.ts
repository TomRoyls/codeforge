export interface BinaryLiftingOptions {
  parents?: number[]
  edges?: [number, number][]
  root?: number
}

export interface BinaryLiftingStats {
  nodeCount: number
  maxDepth: number
  logHeight: number
  root: number
}
