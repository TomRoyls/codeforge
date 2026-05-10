export interface BloomFilterTreeOptions {
  branchingFactor?: number
  expectedItemsPerLeaf?: number
  falsePositiveRate?: number
}

export interface BloomFilterTreeStatistics {
  inserts: number
  removes: number
  queries: number
  leafCount: number
  estimatedMemory: number
}

export interface BloomFilterJSON {
  bits: number[]
  bitCount: number
  hashCount: number
  size: number
}

export interface TreeNodeJSON {
  filter?: BloomFilterJSON
  children?: TreeNodeJSON[]
  isLeaf: boolean
  leafIndex?: number
}

export interface BloomFilterTreeJSON {
  options: Required<BloomFilterTreeOptions>
  size: number
  root: TreeNodeJSON
  leaves: BloomFilterJSON[]
  statistics: BloomFilterTreeStatistics
}

export const DEFAULT_BLOOM_FILTER_TREE_OPTIONS: Required<BloomFilterTreeOptions> = {
  branchingFactor: 4,
  expectedItemsPerLeaf: 1000,
  falsePositiveRate: 0.01,
}
