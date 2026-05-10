export interface WaveletTreeNode {
  bitvector: number[]
  rankPrefix: number[]
  left: WaveletTreeNode | null
  right: WaveletTreeNode | null
  lo: number
  hi: number
}

export interface WaveletTreeOptions {
  alphabet?: number[]
}

export interface RankAllResult {
  rankLess: number
  rankEqual: number
  rankGreater: number
}

export interface WaveletTreeStats {
  length: number
  alphabetSize: number
  height: number
  nodeCount: number
  totalBits: number
}
