export interface CentroidDecompositionResult {
  centroidRoot: number
  parent: Int32Array
  depth: Int32Array
  level: Int32Array
  subtreeSize: Int32Array
  children: number[][]
  originalParent: Int32Array
  originalDepth: Int32Array
}
