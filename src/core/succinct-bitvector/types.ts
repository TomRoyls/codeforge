export interface BitvectorData {
  bits: Uint8Array
  size: number
}

export interface RankIndex {
  blockRanks: Uint32Array
  superBlockRanks: Uint32Array
  select1Samples: Int32Array
  select0Samples: Int32Array
}
