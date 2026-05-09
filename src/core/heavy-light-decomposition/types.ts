export interface HLDPathSegment {
  node: number
  head: number
}

export interface HLDNodeInfo {
  depth: number
  parent: number
  subtreeSize: number
  head: number
  pos: number
}

export interface HLDDecompositionResult {
  head: Int32Array
  pos: Int32Array
  depth: Int32Array
  parent: Int32Array
  subtreeSize: Int32Array
}
