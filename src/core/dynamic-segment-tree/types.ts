export interface SegmentNode {
  sum: number
  min: number
  max: number
  left: SegmentNode | null
  right: SegmentNode | null
}

export interface DynamicSegmentTreeOptions {
  minRange: number
  maxRange: number
}
