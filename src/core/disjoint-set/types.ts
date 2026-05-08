export interface SetNode {
  value: string
  rank: number
  parent: string
  size: number
}

export interface DisjointSetOptions {
  trackSizes: boolean
}

export const DEFAULT_DISJOINT_SET_OPTIONS: DisjointSetOptions = {
  trackSizes: true,
}
