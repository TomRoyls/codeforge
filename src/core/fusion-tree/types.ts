export interface FusionTreeOptions {
  degree?: number
  comparator?: (a: number, b: number) => number
}

export interface FusionTreeStatistics {
  inserts: number
  deletes: number
  searches: number
  rebalances: number
  height: number
}

export interface FusionNode {
  keys: number[]
  children: FusionNode[]
  leaf: boolean
}

export const DEFAULT_FUSION_TREE_OPTIONS: Required<FusionTreeOptions> = {
  degree: 4,
  comparator: (a: number, b: number): number => a - b,
}
