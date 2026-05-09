export interface WaveletNode {
  bitvector: number[]
  rankPrefix: number[]
  left: WaveletNode | null
  right: WaveletNode | null
  lo: number
  hi: number
}

export interface WaveletTreeData {
  root: WaveletNode | null
  dataSize: number
  alphabet: number[]
  symbolToIndex: Map<number, number>
}
