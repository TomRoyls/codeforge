export interface RankSelectData {
  bits: Uint32Array
  length: number
}

export interface RankSelectIndex {
  blocks: Uint32Array
  select1Samples: Int32Array
  select0Samples: Int32Array
}
