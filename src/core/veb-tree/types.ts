export interface VebTreeOptions {
  universeSize?: number
}

export interface VebTreeStatistics {
  inserts: number
  removes: number
  successorQueries: number
  predecessorQueries: number
  universeSize: number
  clusterCount: number
}

export interface VebTreeNodeJSON {
  min: number | undefined
  max: number | undefined
  universeSize: number
  clusters: Array<[number, VebTreeNodeJSON]> | null
  summary: VebTreeNodeJSON | null
}

export interface VebTreeJSON {
  universeSize: number
  size: number
  root: VebTreeNodeJSON
  statistics: VebTreeStatistics
}

export const DEFAULT_VEB_TREE_OPTIONS: Required<VebTreeOptions> = {
  universeSize: 256,
}
