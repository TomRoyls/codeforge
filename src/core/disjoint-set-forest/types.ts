export interface DisjointSetForestNode<T> {
  parent: T
  rank: number
  size: number
}
