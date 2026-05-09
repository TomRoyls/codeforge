export interface LCTNode {
  left: number
  right: number
  parent: number
  pathParent: number
  weight: number
  pathMin: number
  pathMax: number
  pathSum: number
  pathSize: number
  flip: boolean
}

export interface PathAggregateResult {
  min: number
  max: number
  sum: number
  size: number
}
